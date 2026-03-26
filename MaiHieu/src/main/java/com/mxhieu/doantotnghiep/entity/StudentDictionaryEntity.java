package com.mxhieu.doantotnghiep.entity;

import jakarta.persistence.*;
import lombok.*;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "studentdictionary")
public class StudentDictionaryEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "StudentProfileId")
    private StudentProfileEntity studentProfile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "DefinitionExampleId")
    private DefinitionExampleEntity definitionExample;
}
