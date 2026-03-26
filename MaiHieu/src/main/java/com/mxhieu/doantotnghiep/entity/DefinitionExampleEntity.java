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
@Table(name = "definitionexample")
public class DefinitionExampleEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Integer id;

    @Column(name = "Definition")
    private String definition;

    @Column(name = "Example")
    private String example;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PartOfSpeechID")
    private  PartOfSpeechEntity partOfSpeech;

    @OneToMany(mappedBy = "definitionExample", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StudentDictionaryEntity> studentDictionaries;
}
