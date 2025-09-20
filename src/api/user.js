import request from '@/utils/request'

/**
 * 登录
 * @param { username:String, password:String } data
 */
export function login(data) {
  return request({
    url: '/user-center/auth/login',
    method: 'post',
    data
  })
}

/**
 * 获取用户信息
 */
export function getInfo() {
  return request({
    url: '/user-center/auth/me',
    method: 'get'
  })
}

/**
 * 退出登录
 */
export function logout() {
  return request({
    url: '/user-center/auth/logout',
    method: 'post'
  })
}

/**
 * 获取用户列表
 * @param { username:String, email:String, role:String, status:String, page:Number, pageSize:Number } params 查询参数
 * @returns { Promise <{ code:Number, message:String, data:Object }> }
 */
export function getUserList(params) {
  return request({
    url: '/user-center/users',
    method: 'get',
    params
  })
}

/**
 * 添加用户
 * @param { username:String, email:String, password:String, nickname:String, role:String, status:String } data 添加用户参数
 * @returns { Promise <{ code:Number, message:String, data:Object }> }
 */
export function addUser(data) {
  return request({
    url: '/user-center/users',
    method: 'post',
    data
  })
}

/**
 * 删除用户
 * @param { id:Number } id 删除用户参数
 * @returns { Promise <{ code:Number, message:String, data:Object }> }
 */
export function deleteUser(id) {
  return request({
    url: `/user-center/users/${id}`,
    method: 'delete'
  })
}

/**
 * 编辑用户
 * @param { id:Number, username:String, email:String, password:String, nickname:String, role:String, status:String } data 编辑用户参数
 * @returns { Promise <{ code:Number, message:String, data:Object }> }
 */
export function editUser(data) {
  return request({
    url: `/user-center/users/${data.id}`,
    method: 'put',
    data
  })
}
