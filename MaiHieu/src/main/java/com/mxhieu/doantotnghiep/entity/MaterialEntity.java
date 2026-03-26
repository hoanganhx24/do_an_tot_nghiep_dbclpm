package com.mxhieu.doantotnghiep.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "material")
public class MaterialEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Integer id;

    @Column(name = "Title")
    private String title;

    @Column(name = "Type")
    private String type;

    @Column(name = "Url")
    private String url;

    @Column(name = "MaterialData")
    private byte[] materialData;

    @Column(name = "name")
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "LessonID")
    private LessonEntity lesson;


    public MaterialEntity clone(LessonEntity lesson) {
        MaterialEntity cloned = new MaterialEntity();

        cloned.setId(null); // ⭐ BẮT BUỘC: để tạo bản ghi mới
        cloned.setLesson(lesson);

        cloned.setTitle(this.title);
        cloned.setType(this.type);
        cloned.setUrl(this.url);

        // ⭐ Quan trọng: clone mảng byte để tránh share memory
        cloned.setMaterialData(
                this.materialData != null ? this.materialData.clone() : null
        );

        cloned.setName(this.name);

        return cloned;
    }

}
