"use server"

import qs from "qs"

export async function api(
  input: RequestInfo | URL,
  init?: ({ params?: Object; bearerHeader?: string } & RequestInit) | undefined
): Promise<any> {
  const { params, bearerHeader, ...options } = init || { params: {} }
  const queryString = params ? qs.stringify(params) : ""
  const url = input + (queryString ? `?${queryString}` : "")

  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: bearerHeader!,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  })

  const data = await response.json()

  if (!response.ok && !data.error) {
    console.error(data)
    throw new Error(data.message || response.statusText)
  }

  return data
}
