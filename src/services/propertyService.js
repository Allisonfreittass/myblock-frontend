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
        return apiClient.delete(`api/properties/${id}`);
    },

 updateProperty(id, propertyData) {
        const formData = new FormData();
        formData.append('title', propertyData.title);
        formData.append('description', propertyData.description);
        formData.append('location', JSON.stringify(propertyData.location));
        formData.append('details', JSON.stringify(propertyData.details));
        formData.append('rules', JSON.stringify(propertyData.rules));
        formData.append('fees', JSON.stringify(propertyData.fees));
        return apiClient.put(`api/properties/${id}`, formData);
    }

};