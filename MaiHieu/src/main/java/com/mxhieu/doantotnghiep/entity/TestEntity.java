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
@Table(name = "test")
public class TestEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Integer id;

    @Column(name = "Type")
    private String type;

    @Column(name = "Name")
    private String name;


    @ManyToOne(fetch =  FetchType.LAZY)
    @JoinColumn(name = "ModuleID")
    private ModuleEntity module;

    @OneToMany(mappedBy = "test", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AssessmentEntity> assessments;

    @OneToMany(mappedBy = "test", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TestProgressEntity> testProgresses;

    @OneToMany(mappedBy = "test", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TestAttemptEntity> testAttempts;

    @OneToMany(mappedBy = "test", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StudyPlanItemEntity> studyPlanItems;


    public TestEntity clone(ModuleEntity newModule) {
        TestEntity cloned = new TestEntity();

        cloned.setId(null);
        cloned.setType(this.type);
        cloned.setName(this.name);
        cloned.setModule(newModule);

        // Clone assessments nếu có
        if (this.assessments != null) {
            cloned.setAssessments(
                    this.assessments.stream()
                            .map(a -> a.clone(cloned))
                            .toList()
            );
        }

        // Không clone TestAttempt (attempt là kết quả bài làm, không nên nhân bản)
        cloned.setTestAttempts(null);

        return cloned;
    }
}
