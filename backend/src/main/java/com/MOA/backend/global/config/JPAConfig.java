package com.MOA.backend.global.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@Configuration
@EnableJpaAuditing
@EnableJpaRepositories(basePackages = {
        "com.MOA.backend.domain.user",
        "com.MOA.backend.domain.group",
        "com.MOA.backend.domain.member"
})
public class JPAConfig {

}
