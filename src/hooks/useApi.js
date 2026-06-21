import { useState, useCallback } from 'react'
import api from '../api/axios'

// Hook tái sử dụng cho các thao tác gọi API
// Trả về { data, loading, error, execute }
export function useApi(apiFunc) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const execute = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const result = await apiFunc(...args)
      setData(result.data)
      return result.data
    } catch (err) {
      const msg = err.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiFunc])

  return { data, loading, error, execute }
}

// Hook chuyên dùng cho fetch dữ liệu khi component mount
export function useFetch(url, params = {}) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const fetch = useCallback(async (overrideParams) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get(url, { params: overrideParams ?? params })
      setData(res.data)
      return res.data
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi tải dữ liệu.')
    } finally {
      setLoading(false)
    }
  }, [url])

  return { data, loading, error, refetch: fetch }
}
