import apiClient from "./apiClient";

export const userService = {
    getCLientById() {
        return apiClient.get('auth/me')
    }
}