import CryptoJS from 'crypto-js'

/**
 * MD5加密
 * @param text 要加密的文本
 * @returns 加密后的文本
 */
export const md5 = (text: string): string => {
  return CryptoJS.MD5(text).toString()
}

/**
 * AES加密
 * @param text 要加密的文本
 * @param key 密钥
 * @returns 加密后的文本
 */
export const aesEncrypt = (text: string, key: string): string => {
  const keyHex = CryptoJS.enc.Utf8.parse(key)
  const encrypted = CryptoJS.AES.encrypt(text, keyHex, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  })
  return encrypted.toString()
}

/**
 * AES解密
 * @param text 要解密的文本
 * @param key 密钥
 * @returns 解密后的文本
 */
export const aesDecrypt = (text: string, key: string): string => {
  const keyHex = CryptoJS.enc.Utf8.parse(key)
  const decrypted = CryptoJS.AES.decrypt(text, keyHex, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  })
  return decrypted.toString(CryptoJS.enc.Utf8)
}
