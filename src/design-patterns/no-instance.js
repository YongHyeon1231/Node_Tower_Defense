/**
 * 인스턴스 생성을 금지하는 추상 클래스입니다.
 * 이 클래스를 상속받은 클래스는 인스턴스를 생성할 수 없습니다.
 * 주로 정적 메서드만을 포함하는 클래스에서 사용됩니다.
 */
class NoInstance {
  /**
   * 생성자에서 인스턴스 생성이 차단됩니다.
   * @throws {Error} - 인스턴스를 생성하려고 하면 에러를 발생시킵니다.
   */
  constructor() {
    if (new.target === NoInstance) {
      throw new Error("Cannot instantiate abstract class NoInstance.");
    }
    throw new Error("Cannot instantiate static class.");
  }
}

export default NoInstance;
