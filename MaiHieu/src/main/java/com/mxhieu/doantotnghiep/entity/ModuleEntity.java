package com.mxhieu.doantotnghiep.entity;

import com.mxhieu.doantotnghiep.utils.ModuleType;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "module")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModuleEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Integer id;


    @Column(name = "Title")
    private String title;

    @Column(name = "Description")
    private String description;

    @Column(name = "OrderIndex")
    private Long orderIndex;

    @Column(name = "Score")
    private Integer score;

    @Enumerated(EnumType.STRING)
    @Column(name = "Type")
    private ModuleType type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CourseID")
    private CourseEntity course;

    @OneToMany(mappedBy = "module", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LessonEntity> lessons;

    @OneToMany(mappedBy = "module", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TestEntity> tests;

    public ModuleEntity clone(CourseEntity newCourse) {
        ModuleEntity cloned = new ModuleEntity();

        // Reset ID để Hibernate INSERT thay vì UPDATE
        cloned.setId(null);

        // Copy fields đơn giản
        cloned.setTitle(this.title);
        cloned.setDescription(this.description);
        cloned.setOrderIndex(this.orderIndex);
        cloned.setScore(this.score);
        cloned.setType(this.type);

        // Gán module vào course mới
        cloned.setCourse(newCourse);

        // Clone lessons
        if (this.lessons != null) {
            cloned.setLessons(
                    this.lessons.stream()
                            .map(lesson -> lesson.clone(cloned))
                            .toList()
            );
        }
        if(this.tests != null) {
            cloned.setTests(
                    this.tests.stream()
                    .map(test -> test.clone(cloned))
                    .toList()
            );
        }

        return cloned;
    }

}
