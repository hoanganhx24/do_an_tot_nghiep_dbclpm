package com.mxhieu.doantotnghiep.entity;

import com.mxhieu.doantotnghiep.converter.IntegerListConverter;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "studyplan")
public class StudyPlanEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Integer id;

    @Column(name = "GeneratedAt")
    private LocalDateTime generatedAt;

    @Column(name = "StartDate")
    private LocalDate startDate;

    @Column(name = "ConfigJson")
    private String configJson;

    @Column(name = "Status")
    private Integer status;

    @Column(name = "SoLuongNgayHoc")
    private Integer soLuongNgayHoc;

    @Column(name = "NgayHocTrongTuan", columnDefinition = "VARCHAR(50)")
    @Convert(converter = IntegerListConverter.class)
    private List<Integer> ngayHocTrongTuan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "StudentProfileID")
    private StudentProfileEntity studentProfile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TrackID")
    private TrackEntity track;

    @OneToMany(mappedBy = "studyPlan", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<StudyPlanItemEntity> studyPlanItems;
}
