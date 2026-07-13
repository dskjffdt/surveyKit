import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  withCredentials: true,
})

request.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || '请求失败'
    return Promise.reject(new Error(message))
  },
)

export async function http<T>(config: AxiosRequestConfig): Promise<T> {
  const response: AxiosResponse<T> = await request(config)
  return response.data
}

export default request
