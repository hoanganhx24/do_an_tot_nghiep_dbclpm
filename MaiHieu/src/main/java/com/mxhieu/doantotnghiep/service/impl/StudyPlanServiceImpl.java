package com.mxhieu.doantotnghiep.service.impl;

import com.mxhieu.doantotnghiep.converter.StudyPlanConverter;
import com.mxhieu.doantotnghiep.dto.request.StudyPlanRequest;
import com.mxhieu.doantotnghiep.dto.response.*;
import com.mxhieu.doantotnghiep.entity.*;
import com.mxhieu.doantotnghiep.exception.AppException;
import com.mxhieu.doantotnghiep.exception.ErrorCode;
import com.mxhieu.doantotnghiep.repository.*;
import com.mxhieu.doantotnghiep.service.*;
import com.mxhieu.doantotnghiep.utils.ModuleType;
import lombok.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudyPlanServiceImpl implements StudyPlanService {
    private final TrackRepository trackRepository;
    private final EnrollmentCourseRepository enrollmentCourseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final LessonRepository lessonRepository;
    private final TestRepository testRepository;
    private final StudyPlanRepository studyPlanRepository;
    private final StudyPlanConverter studyPlanConverter;
    private final LessonService lessonService;
    private final TestService testService;
    private final TrackService trackService;
    private final LessonProgressRepository lessonProgressRepository;
    private final TestProgressRepository testProgressRepository;

    @Override
    public StudyPlanOverViewResponse getOverviewData(Integer studentId) {
        Integer trackId = trackService.trackDauTienChuaHoanThanhVaMoKhoa(studentId);
        TrackEntity trackEntity = trackRepository.findById(trackId).orElseThrow(() -> new RuntimeException("Track not found"));

        List<EnrollmentEntity> enrollments = enrollmentRepository.findByTrack_IdAndStudentProfile_Id(trackId,studentId);
        List<CourseEntity> courses = getCoursesFromEnrollments(enrollments);
        return StudyPlanOverViewResponse.builder()
                .trackId(trackEntity.getId())
                .trackName(trackEntity.getName())
                .trackDescription(trackEntity.getDescription())
                .overview(createOverview(courses))
                .mucTieuDauRa(createDauRa(trackEntity))
                .thoiGianHocTieuChuan(soNgayHocTieuChuan(courses) != 0 ? soNgayHocTieuChuan(courses) + " ngày học tiêu chuẩn (khoảng 02 giờ/ngày)" : "Chưa có thời gian học tiêu chuẩn")
                .build();
    }
    private boolean isValidStudyDate(LocalDate date, List<Integer> ngayHocTrongTuan) {
        return ngayHocTrongTuan.contains(date.getDayOfWeek().getValue());
    }

    private LocalDate findBefore(LocalDate date, List<Integer> ngayHocTrongTuan) {
        LocalDate d = date.minusDays(1);
        while (!isValidStudyDate(d, ngayHocTrongTuan)) {
            d = d.minusDays(1);
        }
        return d;
    }
    private LocalDate findAfter(LocalDate date, List<Integer> ngayHocTrongTuan) {
        LocalDate d = date.plusDays(1);
        while (!isValidStudyDate(d, ngayHocTrongTuan)) {
            d = d.plusDays(1);
        }
        return d;
    }
    private LocalDate chooseStudyDate(
            LocalDate currentDate,
            int gapDays,
            List<Integer> ngayHocTrongTuan,
            Set<LocalDate> usedDates,
            LocalDate startDate
    ) {
        LocalDate target = currentDate.plusDays(gapDays);

        // 1. target hợp lệ, trống, và KHÔNG trước startDate
        if (!target.isBefore(startDate)
                && isValidStudyDate(target, ngayHocTrongTuan)
                && !usedDates.contains(target)) {
            return target;
        }

        // 2. tìm ngày hợp lệ gần nhất
        LocalDate before = findBefore(target, ngayHocTrongTuan);
        LocalDate after  = findAfter(target, ngayHocTrongTuan);

        // 3. nếu before < startDate → CẤM dùng → chọn after
        if (before.isBefore(startDate)) {
            return after;
        }

        long distBefore = Math.abs(
                java.time.temporal.ChronoUnit.DAYS.between(target, before)
        );
        long distAfter = Math.abs(
                java.time.temporal.ChronoUnit.DAYS.between(target, after)
        );

        // 4. logic bạn đã chốt
        if (distBefore <= distAfter) {
            if (!usedDates.contains(before)) {
                return before;
            }
            return after;
        }

        // 5. ngược lại → chọn sau
        return after;
    }


    @Override
    public void createStudyPlan(StudyPlanRequest studyPlanRequest) {
        List<StudyPlanEntity> oldStudyPlans = studyPlanRepository.findByTrack_IdAndStudentProfile_Id(studyPlanRequest.getTrackId(), studyPlanRequest.getStudentProfileId());
        oldStudyPlans.forEach(oldStudyPlanEntity -> {
            oldStudyPlanEntity.setStatus(1);
        });
        studyPlanRepository.saveAll(oldStudyPlans);


        Collections.sort(studyPlanRequest.getNgayHocTrongTuan());
        TrackEntity trackEntity = trackRepository.findById(studyPlanRequest.getTrackId()).orElseThrow(() -> new RuntimeException("Track not found"));
        List<EnrollmentEntity> enrollments = enrollmentRepository.findByTrack_IdAndStudentProfile_Id(studyPlanRequest.getTrackId(),studyPlanRequest.getStudentProfileId());
        List<CourseEntity> courses = getCoursesFromEnrollments(enrollments);
        List<ItemWrapperLessonAndTest> itemWrappers = getLessonsAndTestsFromCourses(courses);
        int soLuongLesson = soLuongLesson(courses);
        int soNgayHoc = studyPlanRequest.getSoLuongNgayHoc();
        List<ItemWrapperForNgayHoc> danhSachBuoiHoc = createDanhSachBaiHoc(itemWrappers,courses,soLuongLesson,soNgayHoc);
        StudyPlanEntity studyPlanEntity = CreateStudyPlanDetail(danhSachBuoiHoc,studyPlanRequest);
        studyPlanEntity.setTrack(trackEntity);
        studyPlanRepository.save(studyPlanEntity);
    }

    @Override
    public StudyPlanResponse verifyInformation(StudyPlanRequest studyPlanRequest) {
        Collections.sort(studyPlanRequest.getNgayHocTrongTuan());
        List<EnrollmentEntity> enrollments = enrollmentRepository.findByTrack_IdAndStudentProfile_Id(studyPlanRequest.getTrackId(),studyPlanRequest.getStudentProfileId());
        List<CourseEntity> courses = getCoursesFromEnrollments(enrollments);
        List<ItemWrapperLessonAndTest> itemWrappers = getLessonsAndTestsFromCourses(courses);
        int soLuongLesson = soLuongLesson(courses);
        int soNgayHoc = studyPlanRequest.getSoLuongNgayHoc();
        List<ItemWrapperForNgayHoc> danhSachBuoiHoc = createDanhSachBaiHoc(itemWrappers,courses,soLuongLesson,soNgayHoc);
        StudyPlanEntity studyPlanEntity = CreateStudyPlanDetail(danhSachBuoiHoc,studyPlanRequest);
        StudyPlanResponse studyPlanResponse = new StudyPlanResponse();
        System.out.println(DemNgay(studyPlanEntity.getStudyPlanItems()));
        studyPlanResponse.setStartDate(studyPlanRequest.getStartDate());
        studyPlanResponse.setStudentProfileId(studyPlanRequest.getStudentProfileId());
        studyPlanResponse.setTrackId(studyPlanRequest.getTrackId());
        studyPlanResponse.setTongSoBuoiHoc(soLuongLesson > soNgayHoc ? soNgayHoc : soLuongLesson);
        studyPlanResponse.setNgayHocTrongTuan(studyPlanRequest.getNgayHocTrongTuan());
        studyPlanResponse.setTongSoUnits(soLuongLesson);
        studyPlanResponse.setSoUnitsTrenBuoi(tinhSoUnitsTrenBuoi(danhSachBuoiHoc));
        studyPlanResponse.setNgayHoanThanh(tinhNgayHoanThanh(studyPlanEntity));

        return studyPlanResponse;
    }

    private int DemNgay(List<StudyPlanItemEntity> studyPlanItems) {
        Set<LocalDate> dem = new HashSet<>();
        for (StudyPlanItemEntity studyPlanItemEntity : studyPlanItems) {
            dem.add(studyPlanItemEntity.getDate());
        }
        return dem.size();
    }

    @Override
    public Integer checkExistStudyPlan(Integer studentId) {
        List<StudyPlanEntity> studyPlanEntityList = studyPlanRepository.findByStudentProfile_Id(studentId);
        if(studyPlanEntityList != null && !studyPlanEntityList.isEmpty()){
            for(StudyPlanEntity studyPlanEntity : studyPlanEntityList){
                if(studyPlanEntity.getStatus() == 0){
                    return studyPlanEntity.getId();
                }
            }
            throw new AppException(ErrorCode.STUDYPLAN_NOT_ACTIVE);
        }else{
            throw new AppException(ErrorCode.STUDYPLAN_NOT_FOUND);
        }
    }

    @Override
    public InformationOfStudyPlanResponse getInformation(Integer studyPlanId) {
        StudyPlanEntity studyPlanEntity = studyPlanRepository.findById(studyPlanId).orElseThrow(()->new AppException(ErrorCode.STUDYPLAN_NOT_FOUND));
        StudentProfileEntity studentProfile = studyPlanEntity.getStudentProfile();
        int tongSoNgay = studyPlanEntity.getSoLuongNgayHoc();
        int soNgayDaHoc = tinhSoNgayDaHoc(studyPlanEntity.getNgayHocTrongTuan(),studyPlanEntity.getStartDate());
        int soCupDaDat = 0;
        int soUnitDat2CupTroLen = 0;
        int soUnitDaHoanThanh = 0;
        int soUnitTheoKeHoach = 0;
        List<StudyPlanItemResponse> unitsCanHoanThanh = new ArrayList<>();
        for (StudyPlanItemEntity studyPlanItem : studyPlanEntity.getStudyPlanItems()){
            if(!studyPlanItem.getDate().isAfter(LocalDate.now())){
                LessonEntity lesson = studyPlanItem.getLesson();
                TestEntity test = studyPlanItem.getTest();
                if(lesson != null){
                    if(lessonService.isCompletedLesson(lesson.getId(), studentProfile.getId())){
                        soUnitDaHoanThanh ++;
                        int completedStar = lessonService.completedStar(lesson.getId(), studentProfile.getId());
                        soCupDaDat += completedStar;
                        if(completedStar >= 2){
                            soUnitDat2CupTroLen ++;
                        }
                    }else{
                        LessonResponse lessonResponse = new LessonResponse();
                        lessonResponse.setId(lesson.getId());
                        lessonResponse.setTitle(lesson.getTitle());
                        if(lessonService.isLockLesson(lesson.getId(), studentProfile.getId())){
                            lessonResponse.setStatus("LOCK");
                        }else{
                            lessonResponse.setStatus("UNLOCK");
                        }
                        List<LessonResponse> lessonResponses = new ArrayList<>();
                        lessonResponses.add(lessonResponse);
                        StudyPlanItemResponse item = StudyPlanItemResponse.builder()
                                .lessons(lessonResponses)
                                .build();
                        unitsCanHoanThanh.add(item);
                    }
                }else{
                    if(testService.isCompletedTest(test.getId(), studentProfile.getId())){
                        soUnitDaHoanThanh ++;
                        int completedStar = testService.commpletedStar(test.getId(), studentProfile.getId());
                        soCupDaDat += completedStar;
                        if(completedStar >= 2){
                            soUnitDat2CupTroLen ++;
                        }
                    }else{
                        TestResponse testResponse = new TestResponse();
                        testResponse.setId(test.getId());
                        testResponse.setName(test.getName());
                        if(testService.isLock(test.getId(), studentProfile.getId())){
                            testResponse.setStatus("LOCK");
                        }else{
                            testResponse.setStatus("UNLOCK");
                        }
                        List<TestResponse> testResponses = new ArrayList<>();
                        testResponses.add(testResponse);
                        StudyPlanItemResponse item = StudyPlanItemResponse.builder()
                                .tests(testResponses)
                                .build();
                        unitsCanHoanThanh.add(item);
                    }
                }
                soUnitTheoKeHoach ++;
            }
        }
        

        return InformationOfStudyPlanResponse.builder()
                .soNgayHocConLai(tongSoNgay - soNgayDaHoc)
                .soCupDaDat(soCupDaDat)
                .soUnitDat2Cup(soUnitDat2CupTroLen)
                .soUnitDaHoanThanh(soUnitDaHoanThanh)
                .soUnitTheoKeHoach(soUnitTheoKeHoach)
                .tongSoUnit(studyPlanEntity.getStudyPlanItems().size())
                .unitsCanHoanThanh(unitsCanHoanThanh)
                .build();
    }

    private int tinhSoNgayDaHoc(List<Integer> ngayHocTrongTuan, LocalDate startDate) {
        if (ngayHocTrongTuan == null || ngayHocTrongTuan.isEmpty() || startDate == null) {
            return 0;
        }

        LocalDate today = LocalDate.now();

        // Nếu startDate ở tương lai → chưa học ngày nào
        if (startDate.isAfter(today)) {
            return 0;
        }

        int soNgayDaHoc = 0;
        LocalDate date = startDate;

        while (!date.isAfter(today)) {
            int dayOfWeek = date.getDayOfWeek().getValue(); // 1-7 (Mon-Sun)

            if (ngayHocTrongTuan.contains(dayOfWeek)) {
                soNgayDaHoc++;
            }

            date = date.plusDays(1);
        }

        return soNgayDaHoc;
    }


    private LocalDate tinhNgayHoanThanh(StudyPlanEntity studyPlanEntity) {
        LocalDate tinhNgayHoanThanh = studyPlanEntity.getStudyPlanItems().get(studyPlanEntity.getStudyPlanItems().size() -1).getDate();
        return tinhNgayHoanThanh;
    }

    private String tinhSoUnitsTrenBuoi(List<ItemWrapperForNgayHoc> danhSachBuoiHoc) {
        int minUints = 100;
        int maxUints = 0;
        for (ItemWrapperForNgayHoc itemWrapper : danhSachBuoiHoc) {
            if(itemWrapper.getListItemLessonAndTest().size() < minUints ){
                minUints = itemWrapper.getListItemLessonAndTest().size();
            }
            if(itemWrapper.getListItemLessonAndTest().size() > maxUints){
                maxUints = itemWrapper.getListItemLessonAndTest().size();
            }
        }
        if(minUints == maxUints)
            return minUints + "";
        else
            return minUints + "-" + maxUints;

    }

    private List<ItemWrapperForNgayHoc> createDanhSachBaiHoc(List<ItemWrapperLessonAndTest> itemWrappers, List<CourseEntity> courses, int soLuongLesson, int soNgayHoc) {
        List<ItemWrapperForNgayHoc> studyPlan = new ArrayList<>();
        if(soLuongLesson <= soNgayHoc){
            int soLuongLessonCoppy = (soLuongLesson - 1) == 0 ? 1 : (soLuongLesson - 1);
            float khoangThoiGianGiuaCacBuoiHoc = (float) (soNgayHoc - 1) / soLuongLessonCoppy;
            //logic tạo kế hoạch học tập dựa trên khoảng thời gian giữa các buổi học
            int khoangThoiGianChanGiua2Buoi = (int) khoangThoiGianGiuaCacBuoiHoc;
            int thoiGianDu = (soNgayHoc - 1) - (soLuongLessonCoppy * khoangThoiGianChanGiua2Buoi);
            for(int i=0; i< itemWrappers.size(); i++){
                ItemWrapperForNgayHoc itemWrapperForNgayHoc = new ItemWrapperForNgayHoc();
                ItemWrapperLessonAndTest lessonAndTest = itemWrappers.get(i);

                Deque<ItemWrapperLessonAndTest> listItem = new ArrayDeque<>();
                listItem.addFirst(lessonAndTest);
                itemWrapperForNgayHoc.setListItemLessonAndTest(listItem);
                itemWrapperForNgayHoc.setSttBuoiHoc(i);
                if(thoiGianDu != 0){
                    itemWrapperForNgayHoc.setThoiGianDenBaiHocTiepTheo(i + khoangThoiGianChanGiua2Buoi +1);
                    thoiGianDu --;
                }else{
                    itemWrapperForNgayHoc.setThoiGianDenBaiHocTiepTheo(i + khoangThoiGianChanGiua2Buoi);
                }
                studyPlan.add(itemWrapperForNgayHoc);
            }
        }else{
            float thoiGianTrungBinhGiuaCacBuoiHoc = (float) createThoiGianHoc(courses) / soNgayHoc;
            int thoiGianHocCua1Buoi = 0;
            Deque<ItemWrapperLessonAndTest> listItem = new ArrayDeque<>();
            int sttBuoiHoc = 0;
            for(int i=0; i< itemWrappers.size(); i++){


                ItemWrapperLessonAndTest lessonAndTest = itemWrappers.get(i);
                thoiGianHocCua1Buoi += lessonAndTest.getThoiGianHoc();
                listItem.addLast(lessonAndTest);

                if(thoiGianHocCua1Buoi >=  thoiGianTrungBinhGiuaCacBuoiHoc){

                    ItemWrapperForNgayHoc itemWrapperForNgayHoc = new ItemWrapperForNgayHoc();
                    itemWrapperForNgayHoc.setSttBuoiHoc(sttBuoiHoc);
                    itemWrapperForNgayHoc.setListItemLessonAndTest(listItem);
                    itemWrapperForNgayHoc.setThoiGianDenBaiHocTiepTheo(1);

                    studyPlan.add(itemWrapperForNgayHoc);

                    sttBuoiHoc++;
                    thoiGianHocCua1Buoi = 0;
                    listItem = new ArrayDeque<>();

                }
            }
            if(!listItem.isEmpty()){
                ItemWrapperForNgayHoc itemWrapper = ItemWrapperForNgayHoc.builder()
                        .sttBuoiHoc(sttBuoiHoc)
                        .listItemLessonAndTest(listItem)
                        .thoiGianDenBaiHocTiepTheo(1)
                        .build();
                studyPlan.add(itemWrapper);
                sttBuoiHoc++;
            }
            int soBuoiDaCo = studyPlan.size();
            for(int i = 0; i < (soNgayHoc - soBuoiDaCo); i++){
                ItemWrapperForNgayHoc otherItem = ItemWrapperForNgayHoc.builder()
                        .listItemLessonAndTest(new ArrayDeque<>())
                        .sttBuoiHoc(sttBuoiHoc)
                        .thoiGianDenBaiHocTiepTheo(1)
                        .build();
                sttBuoiHoc++;
                studyPlan.add(otherItem);
            }
            sapXepLaiBaiHoc(studyPlan);
        }
        return studyPlan;
    }

    private StudyPlanEntity  CreateStudyPlanDetail(List<ItemWrapperForNgayHoc> studyPlan, StudyPlanRequest request) {
        StudentProfileEntity studentProfile = studentProfileRepository.findById(request.getStudentProfileId()).orElseThrow(() -> new AppException(ErrorCode.STUDENT_PROFILE_NOT_FOUND));

        StudyPlanEntity studyPlanEntity = StudyPlanEntity.builder()
                .generatedAt(LocalDateTime.now())
                .startDate(request.getStartDate())
                .status(0)
                .soLuongNgayHoc(request.getSoLuongNgayHoc())
                .ngayHocTrongTuan(request.getNgayHocTrongTuan())
                .studentProfile(studentProfile)
                .build();

        List<StudyPlanItemEntity> items = new ArrayList<>();
        Set<LocalDate> usedDates = new HashSet<>();

        LocalDate currentDate = request.getStartDate();

        // đảm bảo ngày bắt đầu là ngày học hợp lệ
        if (!isValidStudyDate(currentDate, request.getNgayHocTrongTuan())) {
            currentDate = chooseStudyDate(
                    currentDate.minusDays(1),
                    1,
                    request.getNgayHocTrongTuan(),
                    usedDates,
                    request.getStartDate()
            );
        }

        for (ItemWrapperForNgayHoc buoiHoc : studyPlan) {

            // tạo StudyPlanItem cho từng lesson trong buổi
            for (ItemWrapperLessonAndTest item : buoiHoc.getListItemLessonAndTest()) {

                StudyPlanItemEntity entity = StudyPlanItemEntity.builder()
                        .date(currentDate)
                        .slotIndex(buoiHoc.getSttBuoiHoc())
                        .status(0)
                        .studyPlan(studyPlanEntity)
                        .build();
                if(item.getType().equals("lesson")){
                    LessonEntity lesson = lessonRepository.findById(item.getId()).orElseThrow(()-> new AppException(ErrorCode.LESSON_NOT_FOUND));
                    entity.setLesson(lesson);
                }else{
                    TestEntity test = testRepository.findById(item.getId()).orElseThrow(()-> new AppException(ErrorCode.TEST_NOT_FOUND));
                    entity.setTest(test);
                }

                items.add(entity);
            }

            usedDates.add(currentDate);

            // tính ngày cho buổi tiếp theo
            currentDate = chooseStudyDate(
                    currentDate,
                    buoiHoc.getThoiGianDenBaiHocTiepTheo(),
                    request.getNgayHocTrongTuan(),
                    usedDates,
                    request.getStartDate()
            );
        }

        studyPlanEntity.setStudyPlanItems(items);
        return studyPlanEntity;
    }


    private void sapXepLaiBaiHoc(List<ItemWrapperForNgayHoc> studyPlan) {
        boolean coThayDoi = true;

        while (coThayDoi) {
            coThayDoi = false;

            for (int i = studyPlan.size() - 1; i > 0; i--) {

                Deque<ItemWrapperLessonAndTest> dequeI = coppyDeque(studyPlan.get(i).getListItemLessonAndTest());
                Deque<ItemWrapperLessonAndTest> dequeJ = coppyDeque(studyPlan.get(i - 1).getListItemLessonAndTest());

                int timeI = tinhThoiGianBuoiHoc(dequeI);
                int timeJ = tinhThoiGianBuoiHoc(dequeJ);
                int diffBefore = Math.abs(timeI - timeJ);

                ItemWrapperLessonAndTest moved = new ItemWrapperLessonAndTest();
                if(timeI > timeJ){
                    moved = dequeI.pollFirst();
                    if (moved == null) continue;
                    dequeJ.addLast(moved);
                }else{
                    moved = dequeJ.pollLast();
                    if (moved == null) continue;
                    dequeI.addFirst(moved);
                }

                int diffAfter = Math.abs(
                        tinhThoiGianBuoiHoc(dequeI) -
                                tinhThoiGianBuoiHoc(dequeJ)
                );

                if (diffAfter < diffBefore) {
                    studyPlan.get(i).setListItemLessonAndTest(dequeI);
                    studyPlan.get(i - 1).setListItemLessonAndTest(dequeJ);
                    coThayDoi = true;
                } else if ((diffAfter == diffBefore) && (timeI < timeJ)) {
                    studyPlan.get(i).setListItemLessonAndTest(dequeI);
                    studyPlan.get(i - 1).setListItemLessonAndTest(dequeJ);
                    coThayDoi = true;
                }
            }
        }
    }

    private Deque<ItemWrapperLessonAndTest> coppyDeque(Deque<ItemWrapperLessonAndTest> listItemLessonAndTest) {
        Deque<ItemWrapperLessonAndTest> deque = new ArrayDeque<>();
        for (ItemWrapperLessonAndTest item : listItemLessonAndTest) {
            deque.addLast(item.coppy());
        }
        return deque;
    }


    private int tinhThoiGianBuoiHoc(Deque<ItemWrapperLessonAndTest> listItemLessonAndTest) {
        int tongThoiGian = 0;

        if (listItemLessonAndTest != null) {
            for (ItemWrapperLessonAndTest item : listItemLessonAndTest) {
                tongThoiGian += item.getThoiGianHoc();
            }
        }
        return tongThoiGian;
    }

    private  List<ItemWrapperLessonAndTest> getLessonsAndTestsFromCourses(List<CourseEntity> courseEntities) {
        List<ItemWrapperLessonAndTest> itemWrappers = new ArrayList<>();
        if (courseEntities != null) {
            courseEntities.forEach(course -> {
                if (course.getModules() != null) {
                    course.getModules().forEach(module -> {
                        if (module.getType() == ModuleType.LESSON) {
                            if (module.getLessons() != null) {
                                module.getLessons().forEach(lesson -> {
                                    ItemWrapperLessonAndTest item = new ItemWrapperLessonAndTest();
                                    item.setId(lesson.getId());
                                    item.setType("lesson");
                                    AtomicInteger thoiGianHoc = new AtomicInteger();
                                    if(lesson.getMediaassets() != null){
                                        lesson.getMediaassets().forEach(mediaasset -> {
                                            if(mediaasset.getType().equals("video/mp4"))
                                                thoiGianHoc.addAndGet(mediaasset.getLengthSec());
                                        });
                                    }
                                    thoiGianHoc.addAndGet(1800);
                                    item.setThoiGianHoc(thoiGianHoc.get());
                                    itemWrappers.add(item);
                                });
                            }
                        }else{
                            if(module.getTests() != null){
                                module.getTests().forEach(test -> {
                                    //nếu là bài test thì thêm vào danh sách
                                    ItemWrapperLessonAndTest item = new ItemWrapperLessonAndTest();
                                    item.setId(test.getId());
                                    item.setType("test");
                                    item.setThoiGianHoc(1800);
                                    itemWrappers.add(item);
                                });
                            }
                        }
                    });
                }
            });
        }
        return itemWrappers;
    }

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    static class ItemWrapperForNgayHoc{
        Deque<ItemWrapperLessonAndTest> listItemLessonAndTest = new ArrayDeque<>(); // lessonId - lesson or test
        int sttBuoiHoc;
        int thoiGianDenBaiHocTiepTheo;
    }
    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    static class ItemWrapperLessonAndTest{
        Integer id;
        String type; // lesson or test
        int thoiGianHoc;

        ItemWrapperLessonAndTest coppy(){
            ItemWrapperLessonAndTest result = new ItemWrapperLessonAndTest();
            result.setId(this.id);
            result.setType(this.type);
            result.setThoiGianHoc(this.thoiGianHoc);
            return result;
        }
    }

    private List<CourseEntity> getCoursesFromEnrollments(List<EnrollmentEntity> enrollments) {
        List<CourseEntity> courses = new ArrayList<>();
        for (EnrollmentEntity enrollment : enrollments) {
            List<EnrollmentCourseEntity> enrollmentCourses = enrollment.getEnrollmentCourses();
            for (EnrollmentCourseEntity enrollmentCourse : enrollmentCourses) {
                courses.add(enrollmentCourse.getCourse());
            }
        }
        return courses;
    }

    private int soLuongLesson(List<CourseEntity> courseEntities) {
        AtomicInteger lessonCount = new AtomicInteger(0);
        if (courseEntities != null) {
            courseEntities.forEach(course -> {
                if (course.getModules() != null) {
                    course.getModules().forEach(module -> {
                        if (module.getType() == ModuleType.LESSON) {
                            if (module.getLessons() != null) {
                                lessonCount.addAndGet(module.getLessons().size());
                            }
                        }else{
                            //nếu là bài test thì tính là 1 lesson
                            if(module.getTests() != null){
                                lessonCount.addAndGet(module.getTests().size());
                            }

                        }
                    });
                }
            });
        }
        return lessonCount.get();
    }
    private int createThoiGianHoc(List<CourseEntity> courseEntities) {
        AtomicInteger totalSec = new AtomicInteger(0);

        if (courseEntities != null) {
            courseEntities.forEach(course -> {
                if (course.getModules() != null) {
                    course.getModules().forEach(module -> {
                        if(module.getType() == ModuleType.LESSON){
                            if (module.getLessons() != null) {
                                module.getLessons().forEach(lesson -> {
                                    if (lesson.getMediaassets() != null) {
                                        lesson.getMediaassets().forEach(media -> {
                                            Integer length = media.getLengthSec();
                                            if (length != null) {
                                                totalSec.addAndGet(length);
                                            }

                                        });
                                    }
                                    totalSec.addAndGet(1800); // Thêm 30 phút (1800 giây) cho mỗi bài học
                                });

                            }
                        }else{
                            //nếu là bài test thì tính 30 phút
                            totalSec.addAndGet(1800);
                        }

                    });
                }
            });
        }
        return totalSec.get();
    }

    int soNgayHocTieuChuan(List<CourseEntity> courseEntities){
        int tongThoiGianHoc = createThoiGianHoc(courseEntities);
        int soNgay = (int)Math.ceil((float)tongThoiGianHoc/(2 * 3600)); // Giả sử mỗi ngày học 2 giờ (7200 giây)
        return  soNgay;
    }

    @Override
    public int soNgayHocToiThieu(Integer trackId, Integer studentId){
        TrackEntity trackEntity = trackRepository.findById(trackId).orElseThrow(() -> new RuntimeException("Track not found"));

        List<EnrollmentEntity> enrollments = enrollmentRepository.findByTrack_IdAndStudentProfile_Id(trackId,studentId);
        List<CourseEntity> courses = getCoursesFromEnrollments(enrollments);

        int tongThoiGianHoc = createThoiGianHoc(courses);
        int soNgay = (int)Math.ceil((float)tongThoiGianHoc/(8 * 3600)); // Giả sử mỗi ngày học 8 giờ (28800 giây)
        return  soNgay;
    }

    @Override
    public StudyPlanResponse getStudyPlanDetail(Integer studyPlanId) {
        StudyPlanEntity studyPlanEntity = studyPlanRepository.findById(studyPlanId).orElseThrow(() -> new AppException(ErrorCode.STUDYPLAN_NOT_FOUND));
        System.out.println(DemNgay(studyPlanEntity.getStudyPlanItems()));
        StudyPlanResponse response = studyPlanConverter.toResponseSummery(studyPlanEntity);
        List<StudyPlanItemResponse> studyPlanItemResponses = getStudyPlanItemDetail(studyPlanEntity.getStudyPlanItems(), studyPlanEntity.getStudentProfile().getId());
        response.setStudyPlanItems(studyPlanItemResponses);
        return response;
    }

    private List<StudyPlanItemResponse> getStudyPlanItemDetail(List<StudyPlanItemEntity> studyPlanItems, Integer studentId) {
        List<StudyPlanItemResponse> studyPlanItemResponses = new ArrayList<>();
        if(studyPlanItems != null && !studyPlanItems.isEmpty()){
            List<LessonResponse> lessonResponses = new ArrayList<>();
            List<TestResponse> testResponses = new ArrayList<>();
            if(studyPlanItems.get(0).getLesson() != null){
                lessonResponses.add(getLessonResponseForItem(studyPlanItems.get(0).getLesson(), studentId));
            }else{
                testResponses.add(getTestReposeForItem(studyPlanItems.get(0).getTest(),studentId));
            }

            LocalDate date = studyPlanItems.get(0).getDate();

            for(int i = 1;i<studyPlanItems.size();i++){
                StudyPlanItemEntity studyPlanItem = studyPlanItems.get(i);
                if(studyPlanItem.getDate().equals(date)){
                    if(studyPlanItem.getLesson() != null){
                        lessonResponses.add(getLessonResponseForItem(studyPlanItem.getLesson(), studentId));
                    }else{
                        testResponses.add(getTestReposeForItem(studyPlanItem.getTest(),studentId));
                    }

                }else{
                    StudyPlanItemResponse itemResponse = StudyPlanItemResponse.builder()
                            .date(date)
                            .type("LESSON")
                            .lessons(lessonResponses)
                            .tests(testResponses)
                            .build();
                    studyPlanItemResponses.add(itemResponse);
                    date = studyPlanItem.getDate();
                    lessonResponses = new ArrayList<>();
                    testResponses = new ArrayList<>();
                    if(studyPlanItem.getLesson() != null){
                        lessonResponses.add(getLessonResponseForItem(studyPlanItem.getLesson(), studentId));
                    }else{
                        testResponses.add(getTestReposeForItem(studyPlanItem.getTest(),studentId));
                    }
                }
            }
            StudyPlanItemResponse itemResponse = StudyPlanItemResponse.builder()
                    .date(date)
                    .lessons(lessonResponses)
                    .build();
            studyPlanItemResponses.add(itemResponse);
        }
        return studyPlanItemResponses;
    }

    private TestResponse getTestReposeForItem(TestEntity test, Integer studentId) {
        String status;
        boolean isLock = testService.isLock(test.getId(),studentId);
        boolean isCompleted = testService.isCompletedTest(test.getId(),studentId);
        if(isLock){
            status = "LOCK";
        }else{
            if (isCompleted){
                status = "DONE";
            }else{
                status = "UNLOCK";
            }
        }
        return TestResponse.builder()
                .id(test.getId())
                .name(test.getName())
                .type(test.getType())
                .status(status)
                .build();
    }

    private LessonResponse getLessonResponseForItem(LessonEntity lesson, Integer studentId) {
        String status;
        Boolean isLock = lessonService.isLockLesson(lesson.getId(),studentId);
        Boolean isCompleted = lessonService.isCompletedLesson(lesson.getId(),studentId);
        if(isLock){
            status = "LOCK";
        }else{
            if (isCompleted){
                status = "DONE";
            }else{
                status = "UNLOCK";
            }
        }
        return LessonResponse.builder()
                .id(lesson.getId())
                .title(lesson.getTitle())
                .completedStar(lessonService.completedStar(lesson.getId(),studentId))
                .status(status)
                .build();
    }


    private String createDauRa(TrackEntity trackEntity) {
        switch (trackEntity.getCode()){
            case "0-300":
                return "TOEIC LR 0-300";
            case "300-600":
                return "TOEIC LR 300-600";
            default:
                return "TOEIC LR 600+";
        }
    }

    private String createOverview(List<CourseEntity> courseEntities) {
        if (courseEntities == null || courseEntities.isEmpty()) {
            return "Chưa có khóa học nào trong track này.";
        }
        return courseEntities.stream()
                .map(courseEntity -> courseEntity.getTitle())
                .collect(Collectors.joining(", "));
    }

}
