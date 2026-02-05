package com.Capstone.capstonebackend;

import org.springframework.stereotype.Component;

@Component
public class AppstateAuthProvider {
    public boolean isValidAppStateUser(String username) {
        return username != null && username.toLowerCase().endsWith("@appstate.edu");
    }
}
