    package com.mxhieu.doantotnghiep.config;


    import com.mxhieu.doantotnghiep.entity.RoleEntity;
    import com.mxhieu.doantotnghiep.entity.UserEntity;
    import com.mxhieu.doantotnghiep.entity.UserRoleEntity;
    import com.mxhieu.doantotnghiep.repository.RoleRepository;
    import com.mxhieu.doantotnghiep.repository.UserRepository;
    import com.mxhieu.doantotnghiep.repository.UserRoleRepository;
    import lombok.extern.slf4j.Slf4j;
    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.boot.ApplicationRunner;
    import org.springframework.context.annotation.Bean;
    import org.springframework.context.annotation.Configuration;
    import org.springframework.security.crypto.password.PasswordEncoder;

    import java.time.LocalDateTime;
    import java.util.ArrayList;
    import java.util.List;

    @Configuration
    @Slf4j
    public class ApplicationInitConfig {
        @Autowired
        PasswordEncoder passwordEncoder;
        @Bean
        ApplicationRunner applicationRunner(UserRepository userRepository, RoleRepository roleRepository, UserRoleRepository userRoleRepository ) {
            return args -> {
                if(userRepository.findByEmail("hoang1@gmail.com").isEmpty()){

                    RoleEntity roleEntity = roleRepository.findByValue("ADMIN").get();
                    UserEntity userEntity = UserEntity.builder()
                            .email("hoang1@gmail.com")
                            .fullName("admin")
                            .status("ACTIVE")
                            .password(passwordEncoder.encode("123456"))
                            .createAt(LocalDateTime.now())
                            .build();
                    UserRoleEntity userRoleEntity = UserRoleEntity.builder()
                            .role(roleEntity)
                            .user(userEntity)
                            .build();
                    userRepository.save(userEntity);
                    userRoleRepository.save(userRoleEntity);
                    log.warn("Create admin with email: hoang1@gmail.com - password: 123456");

                }
            };
        }
    }
