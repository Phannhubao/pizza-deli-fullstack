package com.pizza.deli.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailService {
    
    private final JavaMailSender mailSender;
    
    public void sendRegistrationEmail(String toEmail, String username) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("baopnts2111007@fpt.edu.vn");
        message.setTo(toEmail);
        message.setSubject("Đăng ký tài khoản thành công");
        message.setText("Xin chào " + username + ",\n\n"
                + "Cảm ơn bạn đã đăng ký tài khoản tại Pizza Deli.\n"
                + "Tài khoản của bạn đã được tạo thành công.\n\n"
                + "Trân trọng,\n"
                + "Đội ngũ Pizza Deli");
        
        mailSender.send(message);
    }
}