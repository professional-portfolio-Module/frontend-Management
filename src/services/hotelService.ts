import apiClient from "./api";

export interface Hotel {
  id: string;
  name: string;
  country: string;
  city: string;
  createdAt?: string;
}

export const hotelService = {
  async getHotels(): Promise<Hotel[]> {
    try {
      const response = await apiClient.get("/Main/router-backend/api/hotels");
      if (response.data && response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error("Failed to fetch hotels", error);
      return [];
    }
  },

  async createHotel(hotel: Omit<Hotel, "id">): Promise<Hotel> {
    try {
      const response = await apiClient.post("/Main/router-backend/api/hotels", hotel);
      if (response.data && response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data?.message || "Failed to create hotel");
    } catch (error: any) {
      let message = "Failed to create hotel";
      if (error.response?.data?.message) {
        message = error.response.data.message;
      }
      throw new Error(message);
    }
  }
};
