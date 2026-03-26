package com.mxhieu.doantotnghiep.config;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;
import org.thymeleaf.templateresolver.ITemplateResolver;

@Configuration
public class ThymeleafTemplateConfig {
    // Bean chịu trách nhiệm tìm và nạp template HTML trong thư mục resources/templates
    @Bean
    public ITemplateResolver templateResolver() {
        ClassLoaderTemplateResolver templateResolver = new ClassLoaderTemplateResolver();
        templateResolver.setPrefix("templates/");          // Đường dẫn tới thư mục chứa file HTML
        templateResolver.setSuffix(".html");               // Đuôi file template
        templateResolver.setTemplateMode("HTML");          // Kiểu template
        templateResolver.setCharacterEncoding("UTF-8");    // Mã hóa ký tự
        templateResolver.setCacheable(false);              // Tắt cache để dễ debug (bật true trong production)
        return templateResolver;
    }

    // Bean cấu hình TemplateEngine để xử lý template
    @Bean
    public SpringTemplateEngine springTemplateEngine(ITemplateResolver templateResolver) {
        SpringTemplateEngine templateEngine = new SpringTemplateEngine();
        templateEngine.setTemplateResolver(templateResolver);
        return templateEngine;
    }
}
