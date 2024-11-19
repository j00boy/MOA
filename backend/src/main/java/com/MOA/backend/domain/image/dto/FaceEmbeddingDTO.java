package com.MOA.backend.domain.image.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FaceEmbeddingDTO {
    private Long userId;
    private String faceEmbedding;
}
