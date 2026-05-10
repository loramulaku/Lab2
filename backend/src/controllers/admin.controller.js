const userRepo = require('../repositories/mysql/user.repo');
const jobRepo = require('../repositories/mysql/job.repo');
const companyRepo = require('../repositories/mysql/company.repo');
const applicationRepo = require('../repositories/mysql/application.repo');
const roleRepo = require('../repositories/mysql/role.repo');
const bcrypt = require('bcryptjs');

const adminController = {
  async getUsers(req, res) {
    try {
      const { page = 1, limit = 10, search = '', sortBy = 'created_at', sortOrder = 'DESC' } = req.query;
      const offset = (page - 1) * limit;
      
      const result = await userRepo.findAll({
        limit: parseInt(limit),
        offset: parseInt(offset),
        search,
        sortBy,
        sortOrder,
      });

      return res.json({
        users: result.users,
        pagination: {
          total: result.total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(result.total / limit),
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Failed to fetch users' });
    }
  },

  async getUserById(req, res) {
    try {
      const user = await userRepo.findById(req.params.id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      
      const roles = await userRepo.getUserRoles(user.id);
      return res.json({ ...user.toJSON(), roles });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Failed to fetch user' });
    }
  },

  async createUser(req, res) {
    try {
      const { firstName, lastName, email, password, roleIds = [] } = req.body;
      
      const existing = await userRepo.findByEmail(email);
      if (existing) return res.status(409).json({ message: 'Email already exists' });

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await userRepo.create({ firstName, lastName, email, passwordHash });

      for (const roleId of roleIds) {
        await userRepo.assignRole(user.id, roleId);
      }

      return res.status(201).json(user);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Failed to create user' });
    }
  },

  async updateUser(req, res) {
    try {
      const { firstName, lastName, email, isActive, roleIds } = req.body;
      const userId = req.params.id;

      const user = await userRepo.findById(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });

      const updateData = {};
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (email !== undefined) updateData.email = email;
      if (isActive !== undefined) updateData.isActive = isActive;

      await userRepo.update(userId, updateData);

      if (roleIds) {
        const currentRoles = await userRepo.getUserRoles(userId);
        const allRoles = await roleRepo.findAll();
        
        for (const role of allRoles) {
          const shouldHave = roleIds.includes(role.id);
          const currentlyHas = currentRoles.includes(role.name);

          if (shouldHave && !currentlyHas) {
            await userRepo.assignRole(userId, role.id);
          } else if (!shouldHave && currentlyHas) {
            await userRepo.removeRole(userId, role.id);
          }
        }
      }

      const updatedUser = await userRepo.findById(userId);
      return res.json(updatedUser);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Failed to update user' });
    }
  },

  async deleteUser(req, res) {
    try {
      const userId = req.params.id;
      const user = await userRepo.findById(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });

      await userRepo.delete(userId);
      return res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Failed to delete user' });
    }
  },

  async getJobs(req, res) {
    try {
      const { page = 1, limit = 10, search = '', status = '', sortBy = 'created_at', sortOrder = 'DESC' } = req.query;
      const offset = (page - 1) * limit;
      
      const result = await jobRepo.findAll({
        limit: parseInt(limit),
        offset: parseInt(offset),
        search,
        status,
        sortBy,
        sortOrder,
      });

      return res.json({
        jobs: result.jobs,
        pagination: {
          total: result.total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(result.total / limit),
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Failed to fetch jobs' });
    }
  },

  async getJobById(req, res) {
    try {
      const job = await jobRepo.findById(req.params.id);
      if (!job) return res.status(404).json({ message: 'Job not found' });
      return res.json(job);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Failed to fetch job' });
    }
  },

  async updateJob(req, res) {
    try {
      const jobId = req.params.id;
      const job = await jobRepo.findById(jobId);
      if (!job) return res.status(404).json({ message: 'Job not found' });

      await jobRepo.update(jobId, req.body);
      const updatedJob = await jobRepo.findById(jobId);
      return res.json(updatedJob);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Failed to update job' });
    }
  },

  async deleteJob(req, res) {
    try {
      const jobId = req.params.id;
      const job = await jobRepo.findById(jobId);
      if (!job) return res.status(404).json({ message: 'Job not found' });

      await jobRepo.delete(jobId);
      return res.json({ message: 'Job deleted successfully' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Failed to delete job' });
    }
  },

  async getCompanies(req, res) {
    try {
      const { page = 1, limit = 10, search = '', sortBy = 'created_at', sortOrder = 'DESC' } = req.query;
      const offset = (page - 1) * limit;
      
      const result = await companyRepo.findAll({
        limit: parseInt(limit),
        offset: parseInt(offset),
        search,
        sortBy,
        sortOrder,
      });

      return res.json({
        companies: result.companies,
        pagination: {
          total: result.total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(result.total / limit),
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Failed to fetch companies' });
    }
  },

  async getCompanyById(req, res) {
    try {
      const company = await companyRepo.findById(req.params.id);
      if (!company) return res.status(404).json({ message: 'Company not found' });
      return res.json(company);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Failed to fetch company' });
    }
  },

  async updateCompany(req, res) {
    try {
      const companyId = req.params.id;
      const company = await companyRepo.findById(companyId);
      if (!company) return res.status(404).json({ message: 'Company not found' });

      await companyRepo.update(companyId, req.body);
      const updatedCompany = await companyRepo.findById(companyId);
      return res.json(updatedCompany);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Failed to update company' });
    }
  },

  async deleteCompany(req, res) {
    try {
      const companyId = req.params.id;
      const company = await companyRepo.findById(companyId);
      if (!company) return res.status(404).json({ message: 'Company not found' });

      await companyRepo.delete(companyId);
      return res.json({ message: 'Company deleted successfully' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Failed to delete company' });
    }
  },

  async getApplications(req, res) {
    try {
      const { page = 1, limit = 10, status = '', sortBy = 'created_at', sortOrder = 'DESC' } = req.query;
      const offset = (page - 1) * limit;
      
      const result = await applicationRepo.findAll({
        limit: parseInt(limit),
        offset: parseInt(offset),
        status,
        sortBy,
        sortOrder,
      });

      return res.json({
        applications: result.applications,
        pagination: {
          total: result.total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(result.total / limit),
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Failed to fetch applications' });
    }
  },

  async getDashboardStats(req, res) {
    try {
      const totalUsers = await userRepo.findAll({ limit: 1, offset: 0 }).then(r => r.total);
      const totalJobs = await jobRepo.findAll({ limit: 1, offset: 0 }).then(r => r.total);
      const totalCompanies = await companyRepo.findAll({ limit: 1, offset: 0 }).then(r => r.total);
      const applicationStats = await applicationRepo.getStats();

      return res.json({
        users: totalUsers,
        jobs: totalJobs,
        companies: totalCompanies,
        applications: applicationStats,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Failed to fetch dashboard stats' });
    }
  },

  async getRoles(req, res) {
    try {
      const roles = await roleRepo.findAll();
      return res.json(roles);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Failed to fetch roles' });
    }
  },
};

module.exports = adminController;
