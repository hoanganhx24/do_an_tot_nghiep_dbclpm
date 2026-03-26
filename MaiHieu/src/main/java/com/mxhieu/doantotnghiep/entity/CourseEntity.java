package com.mxhieu.doantotnghiep.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "course")
public class CourseEntity {
    @Id
    @Column(name = "ID")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "Title")
    private String title;

    @Column(name = "Description")
    private String description;

    @Column(name = "LevelTag")
    private Integer levelTag;

    @Column(name = "IsPublished")
    private Integer isPublished;

    @Column(name = "ImgData")
    private byte[] imgData;

    @Column(name = "Type")
    private String type;

    @Column(name = "Status")
    private String status;

    @Column(name = "Version")
    private Integer version;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TrackID")
    private TrackEntity track;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TeacherID")
    private TeacherprofileEntity teacherprofile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ParentCourseID")
    private CourseEntity parentCourse;

    @OneToMany(mappedBy = "parentCourse", fetch = FetchType.LAZY)
    private List<CourseEntity> children;

    @OneToMany(mappedBy = "course", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EnrollmentCourseEntity> enrollmentcourse;


    @OneToMany(mappedBy = "course", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ModuleEntity> modules;

    public CourseEntity clone() {
        CourseEntity cloned = new CourseEntity();

        // Reset ID => tạo bản ghi mới
        cloned.setId(null);

        // Clone basic fields
        cloned.setTitle(this.title);
        cloned.setDescription(this.description);
        cloned.setLevelTag(this.levelTag);
        cloned.setVersion(this.version);

        // Khi clone để publish, bạn có thể set isPublished = 1
        cloned.setIsPublished(this.isPublished); // hoặc 1 nếu publish

        // Clone ảnh (quan trọng: tránh share byte[])
        cloned.setImgData(
                this.imgData != null ? this.imgData.clone() : null
        );

        cloned.setType(this.type);

        // Không clone track / teacher, chỉ gán lại reference
        cloned.setTrack(this.track);
        cloned.setTeacherprofile(this.teacherprofile);

        // Deep clone module
        if (this.modules != null) {
            cloned.setModules(
                    this.modules.stream()
                            .map(module -> module.clone(cloned)) // gọi module.clone(newCourse)
                            .toList()
            );
        }

        return cloned;
    }
}
