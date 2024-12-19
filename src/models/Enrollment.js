// src/models/Enrollment.js
import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'
import User from './User.js' // Import model User
import Course from './Course.js' // Import model Course

const Enrollment = sequelize.define(
  'Enrollment',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id'
      }
    },
    course_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Course,
        key: 'id'
      }
    }
  },
  {
    tableName: 'Enrollments',
    timestamps: true
  }
)

export default Enrollment