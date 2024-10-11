/**
 * API 요청 중 발생하는 에러를 처리하는 클래스입니다.
 * @extends {Error}
 */
class ApiError extends Error {
  /**
   * ApiError 생성자
   * @param {string} message - 에러 메시지
   * @param {number} statusCode - HTTP 상태 코드
   */
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export default ApiError;
