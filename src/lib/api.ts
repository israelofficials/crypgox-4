import axios from 'axios'

const baseURL = `${process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000'}/api`

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
})

export default apiClient
