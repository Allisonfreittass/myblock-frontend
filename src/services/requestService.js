import apiClient from "./apiClient"

export const requestService = {
  getRequests() {
    return apiClient.get('api/rent-requests/my-requests')
  },

  createRequest(data) {
    return apiClient.post('api/rent-requests', data)
  },

  updateRequest(id, data) {
    return apiClient.put(`api/rent-requests/${id}/status`, data)
  }
}
