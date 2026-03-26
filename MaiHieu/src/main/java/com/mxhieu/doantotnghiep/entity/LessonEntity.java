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
@Table(name = "lesson")
public class LessonEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Integer id;

    @Column(name = "Title")
    private String title;

    @Column(name = "Summary")
    private String summary;

    @Column(name = "DurationMinutes")
    private Integer durationMinutes;

    @Column(name = "OrderIndex")
    private Integer orderIndex;

    @Column(name = "GatingRules")
    private Integer gatingRules;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ModuleID")
    private ModuleEntity module;

    @OneToMany (mappedBy = "lesson", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MediaAssetEntity> mediaassets;

    @OneToMany (mappedBy = "lesson", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LessonProgressEntity> lessonProgresses;


    @OneToMany(mappedBy = "lesson", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MaterialEntity> materialEntities;

    @OneToMany(mappedBy = "lesson", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ExerciseEntity> exercises;

    @OneToMany(mappedBy = "lesson", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StudyPlanItemEntity> studyPlanItems;

    public LessonEntity clone(ModuleEntity module) {
        LessonEntity lessonEntity = new LessonEntity();

        lessonEntity.setId(null);
        lessonEntity.setTitle(this.title);
        lessonEntity.setSummary(this.summary);
        lessonEntity.setDurationMinutes(this.durationMinutes);
        lessonEntity.setOrderIndex(this.orderIndex);
        lessonEntity.setGatingRules(this.gatingRules);
        lessonEntity.setModule(module);

        // Clone mediaassets safely
        if (this.mediaassets != null) {
            lessonEntity.setMediaassets(
                    this.mediaassets.stream()
                            .filter(m -> m != null)
                            .map(m -> m.clone(lessonEntity))
                            .toList()
            );
        } else {
            lessonEntity.setMediaassets(null);
        }

        // Clone materialEntities safely
        if (this.materialEntities != null) {
            lessonEntity.setMaterialEntities(
                    this.materialEntities.stream()
                            .filter(m -> m != null)
                            .map(m -> m.clone(lessonEntity))
                            .toList()
            );
        } else {
            lessonEntity.setMaterialEntities(null);
        }

        // Clone exercises safely
        if (this.exercises != null) {
            lessonEntity.setExercises(
                    this.exercises.stream()
                            .filter(e -> e != null)
                            .map(e -> e.clone(lessonEntity))
                            .toList()
            );
        } else {
            lessonEntity.setExercises(null);
        }

        // StudyPlanItem không clone
        lessonEntity.setStudyPlanItems(null);

        return lessonEntity;
    }


}
