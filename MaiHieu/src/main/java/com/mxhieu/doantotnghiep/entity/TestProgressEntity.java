package com.mxhieu.doantotnghiep.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "testprogress")
public class TestProgressEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Integer id;

    @Column(name = "Process")
    private Integer process;

    @Column(name = "TotalScore")
    private Float totalScore;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "StudentprofileID")
    private StudentProfileEntity studentProfile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TestID")
    private TestEntity test;
}
