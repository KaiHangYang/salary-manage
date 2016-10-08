# -*- coding: utf-8 -*-
from sqlalchemy import Column, CHAR, INT
from sqlalchemy import ForeignKey
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, relationship, backref
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import and_, or_, func

Base = declarative_base()

class STAFF_INFO(Base):
    __tablename__ = 'staff_info'
    id = Column(INT, primary_key=True, autoincrement=True, nullable=False)
    name = Column(CHAR(20), nullable=False)
    gender = Column(INT, nullable=False, default=0)
    profession_id = Column(INT, ForeignKey("profession_info.id"))

    salary = relationship("SALARY", backref="STAFF_INFO")
    allowance = relationship("ALLOWANCE", backref="STAFF_INFO")
    attendance = relationship("ATTENDANCE", backref="STAFF_INFO")
    bonus = relationship("BONUS", backref="STAFF_INFO")

class PROFESSION_INFO(Base):
    __tablename__ = 'profession_info'
    id = Column(INT, primary_key=True, nullable=False, autoincrement=True)
    name = Column(CHAR(20), nullable=False)
    level = Column(INT)
    salary = Column(INT)
    staff_info = relationship("STAFF_INFO", backref="PROFESSION_INFO")

class SALARY(Base):
    __tablename__ = 'salary'
    staff_id = Column(INT, ForeignKey("staff_info.id"), primary_key=True, nullable=False)
    m_month = Column(INT, primary_key=True, nullable=False)
    salary = Column(INT, nullable=False)

class OVERTIME_TYPE(Base):
    __tablename__ = 'overtime_type'
    id = Column(INT, primary_key=True, nullable=False, autoincrement=True)
    name = Column(CHAR(20))
    salary = Column(INT)

    allowance = relationship("ALLOWANCE", backref="OVERTIME_TYPE")

class ALLOWANCE(Base):
    __tablename__ = 'allowance'
    staff_id = Column(INT, ForeignKey("staff_info.id"), primary_key=True, nullable=False)
    m_month = Column(INT, primary_key=True, nullable=False)
    overtime_id = Column(INT, ForeignKey("overtime_type.id"), primary_key=True, nullable=False)
    m_time = Column(INT, default=0)

class ATTENDANCE(Base):
    __tablename__ = 'attendance'
    staff_id = Column(INT, ForeignKey("staff_info.id"), primary_key=True, nullable=False)
    m_month = Column(INT, primary_key=True, nullable=False)
    leave_time = Column(INT, default=0)
    late_time = Column(INT, default=0)
    absent_time = Column(INT, default=0)
class BONUS(Base):
    __tablename__ = "bonus"
    staff_id = Column(INT, ForeignKey("staff_info.id"), primary_key=True, nullable=False)
    bonus = Column(INT, default=0)


engine = create_engine("mysql+mysqlconnector://root:123456@localhost:3306/m_salary")

DBSession = sessionmaker(bind=engine)

"""
session = DBSession()
a = SALARY(staff_id=5, m_month=1, salary=10)
session.add(a)
session.commit()
session.close()
"""
