package com.mxhieu.doantotnghiep.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "mediaasset")
public class MediaAssetEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Integer id;

    @Column(name = "Type")
    private String type;

    @Column(name = "Url")
    private String url;

    @Column(name = "LengthSec")
    private Integer lengthSec;

    @Column(name = "TranscriptUrl")
    private String transcriptUrl;

    @Column(name = "MediaData")
    private byte[] mediaData;

    @Column(name = "name")
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "LessonID")
    private LessonEntity lesson;

    public MediaAssetEntity clone(LessonEntity lesson) {
        MediaAssetEntity mediaAssetEntity = new MediaAssetEntity();
        mediaAssetEntity.setId(null);
        mediaAssetEntity.setLesson(lesson);
        mediaAssetEntity.setType(this.type);
        mediaAssetEntity.setUrl(this.url);
        mediaAssetEntity.setLengthSec(this.lengthSec);
        mediaAssetEntity.setTranscriptUrl(this.transcriptUrl);

        // tránh NullPointer
        mediaAssetEntity.setMediaData(
                this.mediaData != null ? this.mediaData.clone() : null
        );

        mediaAssetEntity.setName(this.name);
        return mediaAssetEntity;
    }

}
