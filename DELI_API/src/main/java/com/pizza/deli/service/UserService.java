package com.pizza.deli.service;

import com.pizza.deli.dto.UserDTO;
import com.pizza.deli.model.User;
import com.pizza.deli.model.UserStatus;
import com.pizza.deli.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Optional<UserDTO> getUserById(Long id) {
        return userRepository.findById(id)
                .map(this::convertToDTO);
    }

    public UserDTO createUser(User user) {
        validateUser(user);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User savedUser = userRepository.save(user);
        
        // Gửi email thông báo đăng ký thành công
        try {
            emailService.sendRegistrationEmail(user.getEmail(), user.getName());
        } catch (Exception e) {
            // Log lỗi nhưng không làm gián đoạn quá trình tạo user
            System.err.println("Could not send email: " + e.getMessage());
        }
        
        return convertToDTO(savedUser);
    }

    public Optional<UserDTO> updateUser(Long id, User userDetails) {
        return userRepository.findById(id)
                .map(existingUser -> {
                    updateUserFields(existingUser, userDetails);
                    User updatedUser = userRepository.save(existingUser);
                    return convertToDTO(updatedUser);
                });
    }

    public boolean banUser(Long id) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setStatus(UserStatus.BANNED);
                    userRepository.save(user);
                    return true;
                })
                .orElse(false);
    }

    public boolean unbanUser(Long id) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setStatus(UserStatus.ACTIVE);
                    userRepository.save(user);
                    return true;
                })
                .orElse(false);
    }

    private void validateUser(User user) {
        if (user.getEmail() == null || user.getEmail().isEmpty()) {
            throw new IllegalArgumentException("Email không được để trống");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("Email đã được sử dụng");
        }
        if (user.getPassword() == null || user.getPassword().length() < 6) {
            throw new IllegalArgumentException("Mật khẩu phải có ít nhất 6 ký tự");
        }
    }

    private void updateUserFields(User existing, User newDetails) {
        existing.setName(newDetails.getName());
        existing.setBirthDate(newDetails.getBirthDate());
        existing.setAddress(newDetails.getAddress());
        if (newDetails.getPassword() != null && !newDetails.getPassword().isEmpty()) {
            existing.setPassword(passwordEncoder.encode(newDetails.getPassword()));
        }
    }

    private UserDTO convertToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .birthDate(user.getBirthDate())
                .email(user.getEmail())
                .address(user.getAddress())
                .status(user.getStatus())
                .role(user.getRole())
                .build();
    }
}
