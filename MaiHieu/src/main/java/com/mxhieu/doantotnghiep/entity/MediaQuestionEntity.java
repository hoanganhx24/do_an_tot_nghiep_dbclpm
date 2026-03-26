package com.mxhieu.doantotnghiep.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "mediaquestion")
public class MediaQuestionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Integer id;

    @Column(name = "Skill")
    private String skill;

    @Column(name = "Type")
    private String type;

    @Column(name = "Section")
    private String section;

    @Column(name = "AudioUrl")
    private String audioUrl;

    @Column(name = "ImageUrl")
    private String imageUrl;

    @Column(name = "Scirpt")
    private String scirpt;

    @Column(name = "mediaData")
    private byte[] mediaData;

    @OneToOne(mappedBy = "mediaQuestion")
    private QuestionEntity question;

    public MediaQuestionEntity clone() {
        MediaQuestionEntity cloned = new MediaQuestionEntity();

        cloned.setId(null); // MUST reset ID để tạo bản ghi mới

        cloned.setSkill(this.skill);
        cloned.setType(this.type);
        cloned.setSection(this.section);
        cloned.setAudioUrl(this.audioUrl);
        cloned.setImageUrl(this.imageUrl);
        cloned.setScirpt(this.scirpt);

        // Clone media byte[]
        cloned.setMediaData(
                this.mediaData != null ? this.mediaData.clone() : null
        );
        return cloned;
    }

}
