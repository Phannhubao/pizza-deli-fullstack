package com.pizza.deli.service;

   import com.pizza.deli.dto.AuthRequest;
   import com.pizza.deli.dto.AuthResponse;
   import com.pizza.deli.model.User;
import com.pizza.deli.model.UserStatus;
import com.pizza.deli.repository.UserRepository;
   import com.pizza.deli.config.JwtUtil;
   import lombok.RequiredArgsConstructor;
   import org.springframework.security.authentication.AuthenticationManager;
   import org.springframework.security.authentication.BadCredentialsException;
   import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
   import org.springframework.stereotype.Service;

   import java.util.Collections;

   @Service
   @RequiredArgsConstructor
   public class AuthService {

       private final AuthenticationManager authenticationManager;
       private final UserRepository userRepository;
       private final JwtUtil jwtUtil;

       public AuthResponse login(AuthRequest authRequest) {
           try {
               Authentication authentication = authenticationManager.authenticate(
                   new UsernamePasswordAuthenticationToken(
                       authRequest.getEmail(),
                       authRequest.getPassword()
                   )
               );

               SecurityContextHolder.getContext().setAuthentication(authentication);
               User user = userRepository.findByEmail(authRequest.getEmail())
                   .orElseThrow(() -> new IllegalArgumentException("User not found"));

               if (user.getStatus() != UserStatus.ACTIVE) {
                   throw new IllegalStateException("User account is not active");
               }

               String token = jwtUtil.generateToken(
                   new org.springframework.security.core.userdetails.User(
                       user.getEmail(),
                       user.getPassword(),
                       Collections.singletonList(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
                   )
               );

               return AuthResponse.builder()
                   .token(token)
                   .email(user.getEmail())
                   .role(user.getRole().name())
                   .name(user.getName())
                   .id(user.getId())
                   .build();

           } catch (BadCredentialsException e) {
               throw new IllegalArgumentException("Invalid email or password");
           }
       }

       public void logout() {
           SecurityContextHolder.clearContext();
       }
   }
