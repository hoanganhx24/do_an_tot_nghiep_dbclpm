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
@Table(name = "partofspeech")
public class PartOfSpeechEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Integer id;

    @Column(name = "PartOfSpeech")
    private String partOfSpeech;

    @Column(name = "Ipa")
    private String ipa;

    @Column(name = "Audio")
    private String audio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "DictionaryID")
    private DictionaryEntity dictionary;

    @OneToMany(mappedBy = "partOfSpeech", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DefinitionExampleEntity> definitionExample;
}
