abstract class Scope {
  public allowApi: Array<string>
  public allowModule: Array<string>
  public forbidden: Array<string>

  constructor() {
    this.allowApi = []
    this.allowModule = []
    this.forbidden = []
  }
}

class UserScope extends Scope {
  constructor() {
    super()
    this.allowApi = this.allowApi.concat(
      ['v1.user+getUser'],
      ['v1.classic+getLatest', 'v1.classic+getNext', 'v1.classic+getPrev', 'v1.classic+getFavor'],
      ['v1.book+getShortComment', 'v1.book+getFavorBookCount'],
      ['v1.like+confirmLike', 'v1.like+cancelLike'],
    )
    this.allowModule = []
    this.forbidden = []
  }
}

class AdminScope extends Scope {
  constructor() {
    super()

  }
}

class SuperScope extends Scope {
  constructor() {
    super()

  }
}

const matchScope = {
  UserScope,
  AdminScope,
  SuperScope,
}

export function isInScope(scopeName: string, endpoint: any) {
  // @ts-ignore
  const scope = new matchScope[scopeName]()
  const prefix = endpoint.split('+')[0]
  if (scope.forbidden.includes(endpoint)) return false
  if (scope.allowApi.includes(endpoint)) return true
  if (scope.allowModule.includes(prefix)) return true
  return false
}
