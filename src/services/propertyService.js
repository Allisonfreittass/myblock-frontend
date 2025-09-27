import apiClient from './apiClient.js';

export const propertyService = {
    getProperties() {
        return apiClient.get('api/properties')
    },
    getMyProperties() {
        return apiClient.get('api/properties/my');
    },

    getPropertyById(id) {
        return apiClient.get(`api/properties/${id}`);
    },

    updatePropertyStatus(id, newStatus) {
        return apiClient.patch(`api/properties/${id}/status`, { status: newStatus });
    },
    deleteProperty(id) {
        return apiClient.delete(`/properties/${id}`);
    },
    
    updateProperty(id, propertyData) {
         return apiClient.put(`/properties/${id}`, propertyData);
    }

};