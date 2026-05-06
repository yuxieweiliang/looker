// 全局类型声明

declare const plus: PlusStatic

declare interface PlusStatic {
  geolocation: PlusGeolocation
  android: PlusAndroid
}

declare interface PlusGeolocation {
  getCurrentPosition(
    successCallback: (result: GeolocationResult) => void,
    errorCallback?: (error: Error) => void,
    options?: GeolocationOptions
  ): void
}

declare interface GeolocationResult {
  coords: {
    latitude: number
    longitude: number
    altitude: number
    accuracy: number
    altitudeAccuracy: number
    heading: number
    speed: number
  }
  timestamp: number
  addresses?: string
}

declare interface GeolocationOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
  provider?: string
  coordsType?: string
  geocode?: boolean
}

declare interface PlusAndroid {
  requestPermissions(
    permissions: string[],
    callback: (result: PermissionResult) => void,
    errorCallback?: () => void
  ): void
}

declare interface PermissionResult {
  granted: string[]
  denied: string[]
  alwaysDenied: string[]
}

// uni-app 扩展
declare namespace UniApp {
  interface GetLocationSuccess {
    latitude: number
    longitude: number
    speed?: number
    accuracy?: number
    altitude?: number
    verticalAccuracy?: number
    horizontalAccuracy?: number
    address?: string
  }
}
