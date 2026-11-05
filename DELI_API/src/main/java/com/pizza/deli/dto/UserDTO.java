package com.pizza.deli.dto;

import java.time.LocalDate;

import com.pizza.deli.model.Role;
import com.pizza.deli.model.UserStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
    private Long id;
    private String name;
    private LocalDate birthDate;
    private String email;
    private String address;
    private UserStatus status;
    private Role role;
}