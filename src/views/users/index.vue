vue
<template>
  <div class="users">
    <div class="users-search">
      <el-form :model="queryForm" :inline="true">
        <el-form-item label="用户名">
          <el-input v-model="queryForm.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="queryForm.email" placeholder="请输入邮箱" clearable />
        </el-form-item>
        <el-form-item label="来源">
          <el-select v-model="queryForm.source" placeholder="请选择来源">
            <el-option label="管理员创建" value="admin-created" />
          </el-select>
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="queryForm.role" placeholder="请选择角色">
            <el-option label="超级管理员" value="superadmin" />
            <el-option label="管理员" value="admin" />
            <el-option label="普通用户" value="user" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" placeholder="请选择状态">
            <el-option label="正常" value="active" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="success" @click="handleAdd">添加用户</el-button>
      </el-form>
    </div>
    <div class="users-table">
      <el-table v-loading="loading" :data="usersData" border style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="180" />
        <el-table-column prop="email" label="邮箱" width="220" />
        <el-table-column prop="source" label="来源" width="120">
          <template slot-scope="scope">
            {{ scope.row.source === 'admin-created' ? '管理员创建' : '其他' }}
          </template>
        </el-table-column>
        <el-table-column prop="role" label="角色" width="120">
          <template slot-scope="scope">
            {{ scope.row.role === 'superadmin' ? '超级管理员' : scope.row.role === 'admin' ? '管理员' : '普通用户' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            {{ scope.row.status === 'active' ? '正常' : '禁用' }}
          </template>
        </el-table-column>
        <el-table-column prop="disabledRemark" label="禁用原因" />
        <el-table-column prop="createdAt" label="创建时间" width="200">
          <template slot-scope="scope">
            {{ $parseTime(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="200">
          <template slot-scope="scope">
            {{ $parseTime(scope.row.updatedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="danger" size="mini" @click="handleDelete(scope.row)">删除</el-button>
            <el-button
              size="mini"
              :type="scope.row.status === 'active' ? 'info' : 'success'"
              @click="handleChangeStatus(scope.row)"
            >
              {{ scope.row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :current-page="queryParams.page"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="queryParams.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="queryParams.total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="40%">
      <el-form ref="userForm" label-width="100px" :model="userForm" :rules="userRules">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item v-if="!isEdit" label="密码" prop="password">
          <el-input v-model="userForm.password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="userForm.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" placeholder="请选择角色">
            <el-option label="超级管理员" value="superadmin" />
            <el-option label="管理员" value="admin" />
            <el-option label="普通用户" value="user" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="userForm.status" placeholder="请选择状态">
            <el-option label="正常" value="active" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="禁用用户" :visible.sync="disableDialogVisible" width="30%">
      <el-form>
        <el-form-item label="禁用原因">
          <el-input v-model="disableReason" type="textarea" :rows="4" placeholder="请输入禁用原因" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="disableDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmDisableUser">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getUserList, addUser, deleteUser, editUser } from '@/api/user'

export default {
  name: 'Users',
  data() {
    return {
      loading: false,
      dialogVisible: false,
      dialogTitle: '添加用户',
      queryForm: {
        username: '',
        email: '',
        role: '',
        status: ''
      },
      queryParams: {
        page: 1,
        pageSize: 10,
        total: null
      },
      userForm: {
        id: undefined,
        username: '',
        email: '',
        password: '',
        nickname: '',
        role: 'user',
        status: 'active'
      },
      isEdit: false,
      disableReason: '',
      disableDialogVisible: false,
      currentUser: null,
      userRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ],
        password: [
          { required: function() { return !this.isEdit }, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
        ],
        nickname: [
          { required: true, message: '请输入昵称', trigger: 'blur' },
          { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
        ],
        role: [
          { required: true, message: '请选择角色', trigger: 'change' }
        ],
        status: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ]
      },
      usersData: []
    }
  },
  mounted() {
    this.getUserList()
  },
  methods: {
    handleSearch() {
      this.getUserList()
    },
    handleReset() {
      this.queryForm = {
        username: '',
        email: '',
        role: '',
        status: ''
      }
      this.getUserList()
    },
    getUserList() {
      this.loading = true
      getUserList({ ...this.queryParams, ...this.queryForm }).then(res => {
        this.usersData = res.data.users
        this.queryParams.total = res.data.total
        this.loading = false
      })
    },
    handleAdd() {
      this.dialogTitle = '添加用户'
      this.isEdit = false
      this.userForm = {
        id: undefined,
        username: '',
        email: '',
        password: '',
        nickname: '',
        role: 'user',
        status: 'active'
      }
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.userForm && this.$refs.userForm.clearValidate()
      })
    },

    handleEdit(row) {
      this.dialogTitle = '编辑用户'
      this.isEdit = true
      this.userForm = {
        id: row.id,
        username: row.username,
        email: row.email,
        password: '', // 密码置空，表示不修改
        nickname: row.nickname,
        role: row.role,
        status: row.status
      }
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.userForm && this.$refs.userForm.clearValidate()
      })
    },

    handleDelete(row) {
      this.$confirm(`确定要删除${row.username}用户吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        deleteUser(row.id).then(res => {
          this.$message({
            type: 'success',
            message: '删除用户成功!'
          })
          this.getUserList()
        }).catch(error => {
          console.error('删除用户失败:', error)
          this.$message({
            type: 'error',
            message: '删除用户失败: ' + (error.message || '未知错误')
          })
        }).finally(() => {
          this.loading = false
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },

    handleChangeStatus(row) {
      if (row.status === 'active') {
        // 禁用用户
        this.disableDialogVisible = true
        this.currentUser = row
        this.disableReason = ''
      } else {
        // 启用用户
        this.enableUser(row)
      }
    },

    confirmDisableUser() {
      if (!this.currentUser) return

      const userData = {
        id: this.currentUser.id,
        status: 'disabled',
        disabledRemark: this.disableReason || '管理员禁用'
      }

      this.loading = true
      editUser(userData).then(res => {
        this.$message({
          type: 'success',
          message: '禁用用户成功!'
        })
        this.disableDialogVisible = false
        this.getUserList()
      }).catch(error => {
        console.error('禁用用户失败:', error)
        this.$message({
          type: 'error',
          message: '禁用用户失败: ' + (error.message || '未知错误')
        })
      }).finally(() => {
        this.loading = false
        this.currentUser = null
      })
    },

    enableUser(row) {
      const userData = {
        id: row.id,
        status: 'active',
        disabledRemark: ''
      }

      this.loading = true
      editUser(userData).then(res => {
        this.$message({
          type: 'success',
          message: '启用用户成功!'
        })
        this.getUserList()
      }).catch(error => {
        console.error('启用用户失败:', error)
        this.$message({
          type: 'error',
          message: '启用用户失败: ' + (error.message || '未知错误')
        })
      }).finally(() => {
        this.loading = false
      })
    },
    submitForm() {
      this.$refs.userForm.validate(valid => {
        if (valid) {
          this.loading = true
          // 如果是编辑且密码为空，不传密码字段
          const formData = { ...this.userForm }
          if (this.isEdit && !formData.password) {
            delete formData.password
          }

          const request = this.isEdit ? editUser(formData) : addUser(formData)
          const actionText = this.isEdit ? '编辑' : '添加'

          request.then(res => {
            this.$message({
              type: 'success',
              message: `${actionText}用户成功!`
            })
            this.dialogVisible = false
            this.getUserList()
          }).catch(error => {
            console.error(`${actionText}用户失败:`, error)
            this.$message({
              type: 'error',
              message: `${actionText}用户失败: ` + (error.message || '未知错误')
            })
          }).finally(() => {
            this.loading = false
          })
        } else {
          return false
        }
      })
    },
    handleSizeChange(size) {
      this.queryParams.pageSize = size
      this.getUserList()
    },
    handleCurrentChange(page) {
      this.queryParams.page = page
      this.getUserList()
    }
  }

}
</script>

<style lang="scss" scoped>
.users {
  padding: 20px;
}

.password-tip {
  color: #999;
  font-size: 12px;
  margin-left: 5px;
}
</style>
