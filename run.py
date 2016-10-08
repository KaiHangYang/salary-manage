# -*- coding: utf-8 -*-
from tornado import (
    ioloop,
    web,
    httpserver,
    template,
)
import orm
import os

LEAVE_S = 30
LATE_S = 20
ABSENT_S = 100

class MainApplication(web.Application):
    def __init__(self, settings, db_engine):
        route = [
            [r'/', MainHandler],
            [r'/pro', ProfessionHandler],
            [r'/overtime', OvertimeHandler],
            [r'/staff', StaffHandler],
            [r'/allowance', AllowanceHandler],
            [r'/attendance', AttendanceHandler],
            [r'/salary', SalaryHandler],
            [r'/bonus', FinalBonus],
        ]
        web.Application.__init__(self, route, **settings)

        self.orm = orm
        self.template_path = settings["template_path"]

        self.static_path = settings["static_path"]


class MainHandler(web.RequestHandler):
    def get(self):
        self.render("index.html")

class ProfessionHandler(web.RequestHandler):
    # post 直接获取数据
    def post(self):
        session = orm.DBSession()
        result = session.query(orm.PROFESSION_INFO).all()
        data = dict()
        for i in result:
            data[i.id] = dict(id=i.id, name=i.name, level=i.level, salary=i.salary)
        session.close()
        self.write(data)
    #put 用于添加和更改数据
    def put(self):
        action = self.get_body_argument("action")
        
        p_name = self.get_body_argument("name")
        p_level = self.get_body_argument("level")
        p_salary = self.get_body_argument("salary")
        session = orm.DBSession()
        if action == 'update':
            p_id = self.get_body_argument("id")
            elm = session.query(orm.PROFESSION_INFO).filter_by(id=p_id).one()
            
            try:
                elm.name = p_name
                elm.level = p_level
                elm.salary = p_salary
                session.commit()
                session.close()
            except:
                self.write(dict(result=0, msg="填充数据有问题!"))
            else:
                self.write(dict(result=1, msg="更新完成!"))
        elif action == 'add':
            elm = orm.PROFESSION_INFO(name=p_name, level=p_level, salary=p_salary)
            try:
                session.add(elm)
                session.commit()
            except:
                self.write(dict(result=0, msg="填充数据有问题!"))
            else:
                self.write(dict(result=1, msg="添加完成!"))
            session.close()
        
        
    #delete 用于删除数据
    def delete(self):
        p_id = self.get_body_argument("id")
        session = orm.DBSession()
        elm = session.query(orm.PROFESSION_INFO).filter_by(id=p_id)
        try:
            elm.delete()
            session.commit()
        except:
            self.write(dict(result=0, msg="删除失败!"))
        else:
            self.write(dict(result=1, msg="删除成功!"))

        session.close()
        

class OvertimeHandler(web.RequestHandler):
    def post(self):
        session = orm.DBSession()
        result = session.query(orm.OVERTIME_TYPE).all()
        data = dict();
        for i in result:
            data[i.id] = dict(id=i.id, name=i.name, salary=i.salary)

        self.write(data)

    def put(self):
        action = self.get_body_argument("action")
        name = self.get_body_argument("name")
        salary = self.get_body_argument("salary")
        session = orm.DBSession()

        if action == "update":
            p_id = self.get_body_argument("id")
            elm = session.query(orm.OVERTIME_TYPE).filter_by(id=p_id).one()
            
            try:
                elm.name = name
                elm.salary = salary
                session.commit()
               
            except:
                self.write(dict(result=0, msg="填充数据有问题!"))
            else:
                self.write(dict(result=1,msg="修改完成!"))
            session.close()

        elif action == "add":
            elm = orm.OVERTIME_TYPE(name=name, salary=salary)
            try:
                session.add(elm)
                session.commit()
                
            except:
                self.write(dict(result=0, msg="填充数据有问题!"))
            else:
                self.write(dict(result=1, msg="添加数据成功!"))

            session.close()

    def delete(self):
        p_id = self.get_body_argument("id")
        session = orm.DBSession()
        elm = session.query(orm.OVERTIME_TYPE).filter_by(id=p_id);

        try:
            elm.delete()
            session.commit()
        except:
            self.write(dict(result=0, msg="数据删除失败!"))
        else:
            self.write(dict(result=1, msg="数据删除成功!"))
        session.close()


class StaffHandler(web.RequestHandler):
    def post(self):
        session = orm.DBSession()
        staff_result = session.query(orm.STAFF_INFO).all()
        pro_result = session.query(orm.PROFESSION_INFO.id, orm.PROFESSION_INFO.name).all()
        data = dict(staff=dict(), pro=dict())
        for i in staff_result:
            data["staff"][i.id] = dict(id=i.id, name=i.name, gender=i.gender, profession_id=i.profession_id)

        #for i in pro_result:
        #    data["pro"][i.id] = dict(id=i.id, name=i.name)

        self.write(data)

    def put(self):
        session = orm.DBSession()

        action = self.get_body_argument("action")
        name = self.get_body_argument("name")
        gender = self.get_body_argument("gender")
        profession_id = self.get_body_argument("profession_id")

        if action == "update":
            p_id = self.get_body_argument("id")
            elm = session.query(orm.STAFF_INFO).filter_by(id=p_id).one()

            try:
                elm.name = name
                elm.gender = gender
                elm.profession_id = profession_id
                session.commit()
                
            except:
                self.write(dict(result=0, msg="填充数据有问题!"))
            else:
                self.write(dict(result=1, msg="更改员工成功!"))
            session.close()

        elif action == "add":
            elm = orm.STAFF_INFO(name=name, gender=gender, profession_id=profession_id)

            try:
                session.add(elm)
                session.commit()
                
            except:
                self.write(dict(result=0, msg="填充数据有问题!"))
            else:
                self.write(dict(result=1, msg="添加员工成功!"))
            session.close();

    def delete(self):
        session = orm.DBSession()
        p_id = self.get_body_argument("id")
        elm = session.query(orm.STAFF_INFO).filter_by(id=p_id)

        try:
            elm.delete()
            session.commit()
            
        except:
            self.write(dict(result=0, msg="员工删除失败!"))
        else:
            self.write(dict(result=1, msg="员工删除成功!"))
        session.close()

class AllowanceHandler(web.RequestHandler):
    def post(self):
        session = orm.DBSession()
        action = self.get_body_argument("action")
        result = None

        if action == "all":
            result = session.query(orm.ALLOWANCE.m_month, orm.STAFF_INFO.name, orm.STAFF_INFO.id, orm.OVERTIME_TYPE.name, orm.OVERTIME_TYPE.id, orm.ALLOWANCE.m_time).filter(orm.and_(orm.STAFF_INFO.id == orm.ALLOWANCE.staff_id, orm.ALLOWANCE.overtime_id==orm.OVERTIME_TYPE.id)).order_by(orm.ALLOWANCE.m_month, orm.STAFF_INFO.name, orm.OVERTIME_TYPE.name).all()
        elif action == "omonth":
            month = self.get_body_argument("m_month")
            result = session.query(orm.ALLOWANCE.m_month, orm.STAFF_INFO.name, orm.STAFF_INFO.id, orm.OVERTIME_TYPE.name, orm.OVERTIME_TYPE.id, orm.ALLOWANCE.m_time).filter(orm.and_(orm.STAFF_INFO.id == orm.ALLOWANCE.staff_id, orm.ALLOWANCE.overtime_id==orm.OVERTIME_TYPE.id, orm.ALLOWANCE.m_month==month)).order_by(orm.ALLOWANCE.m_month, orm.STAFF_INFO.name, orm.OVERTIME_TYPE.name).all()
        elif action == "oname":
            staff_id = self.get_body_argument("staff_id")
            result = session.query(orm.ALLOWANCE.m_month, orm.STAFF_INFO.name, orm.STAFF_INFO.id, orm.OVERTIME_TYPE.name, orm.OVERTIME_TYPE.id, orm.ALLOWANCE.m_time).filter(orm.and_(orm.ALLOWANCE.staff_id==staff_id, orm.STAFF_INFO.id == orm.ALLOWANCE.staff_id, orm.ALLOWANCE.overtime_id==orm.OVERTIME_TYPE.id)).order_by(orm.ALLOWANCE.m_month, orm.STAFF_INFO.name, orm.OVERTIME_TYPE.name).all()
        elif action == "onm":
            staff_id = self.get_body_argument("staff_id")
            month = self.get_body_argument("m_month")
            result = session.query(orm.ALLOWANCE.m_month, orm.STAFF_INFO.name, orm.STAFF_INFO.id, orm.OVERTIME_TYPE.name, orm.OVERTIME_TYPE.id, orm.ALLOWANCE.m_time).filter(orm.and_(orm.ALLOWANCE.staff_id==staff_id, orm.STAFF_INFO.id == orm.ALLOWANCE.staff_id, orm.ALLOWANCE.overtime_id==orm.OVERTIME_TYPE.id, orm.ALLOWANCE.m_month==month)).order_by(orm.ALLOWANCE.m_month, orm.STAFF_INFO.name, orm.OVERTIME_TYPE.name).all()
        session.close()

        if result != None:
            data = dict()
            all_data = dict()
            j = 0;
            for i in result:
                data[str(j)] = dict(m_month=i[0], staff_name=i[1], staff_id=i[2], overtime_name=i[3], overtime_id=i[4], m_time=i[5])
                j = j+1
            all_data["data"] = data
            self.write(all_data)
        else:
            self.write(None)


    def put(self):
        session = orm.DBSession()
        action = self.get_body_argument("action")
        m_month = self.get_body_argument("m_month")
        staff_id = self.get_body_argument("staff_id")
        overtime_id = self.get_body_argument("overtime_id")
        m_time = self.get_body_argument("m_time")

        if action == 'update':
            try:
                result = session.query(orm.ALLOWANCE).filter(orm.and_(orm.ALLOWANCE.staff_id==staff_id, orm.ALLOWANCE.m_month==m_month, orm.ALLOWANCE.overtime_id==overtime_id)).one()
                result.m_time = m_time

                session.commit()
            except:
                self.write(dict(result=0, msg="更新加班信息失败!"))
            else:
                self.write(dict(result=1, msg="更新加班信息成功!"))

            session.close()

        elif action == 'add':
            elm = orm.ALLOWANCE(staff_id=staff_id, m_month=m_month, overtime_id=overtime_id, m_time=m_time)
            try:
                session.add(elm)
                session.commit()
            except:
                self.write(dict(result=0, msg="添加加班信息失败!"))
            else:
                self.write(dict(result=1, msg="添加加班信息成功!"))

            session.close()
    def delete(self):
        session = orm.DBSession()

        staff_id = self.get_body_argument("staff_id")
        m_month = self.get_body_argument("m_month")
        overtime_id = self.get_body_argument("overtime_id")

        try:
            result = session.query(orm.ALLOWANCE).filter(orm.and_(orm.ALLOWANCE.staff_id==staff_id, orm.ALLOWANCE.m_month == m_month, orm.ALLOWANCE.overtime_id==overtime_id))
            result.delete()
            session.commit()
        except:
            self.write(dict(result=0, msg="删除加班信息失败!"))
        else:
            self.write(dict(result=1, msg="删除加班信息成功!"))
        session.close()

class AttendanceHandler(web.RequestHandler):
    def post(self):
        session = orm.DBSession()
        action = self.get_body_argument("action")
        result = None

        if action == "all":
            result = session.query(orm.ATTENDANCE.m_month, orm.STAFF_INFO.name, orm.STAFF_INFO.id, orm.ATTENDANCE.leave_time, orm.ATTENDANCE.late_time, orm.ATTENDANCE.absent_time).filter(orm.and_(orm.STAFF_INFO.id == orm.ATTENDANCE.staff_id)).order_by(orm.ATTENDANCE.m_month, orm.STAFF_INFO.name).all()
        elif action == "omonth":
            month = self.get_body_argument("m_month")
            result = session.query(orm.ATTENDANCE.m_month, orm.STAFF_INFO.name, orm.STAFF_INFO.id, orm.ATTENDANCE.leave_time, orm.ATTENDANCE.late_time, orm.ATTENDANCE.absent_time).filter(orm.and_(orm.STAFF_INFO.id == orm.ATTENDANCE.staff_id, orm.ATTENDANCE.m_month==month)).order_by(orm.ATTENDANCE.m_month, orm.STAFF_INFO.name).all()
        elif action == "oname":
            staff_id = self.get_body_argument("staff_id")
            result = session.query(orm.ATTENDANCE.m_month, orm.STAFF_INFO.name, orm.STAFF_INFO.id, orm.ATTENDANCE.leave_time, orm.ATTENDANCE.late_time, orm.ATTENDANCE.absent_time).filter(orm.and_(orm.ATTENDANCE.staff_id==staff_id, orm.STAFF_INFO.id == orm.ATTENDANCE.staff_id)).order_by(orm.ATTENDANCE.m_month, orm.STAFF_INFO.name).all()
        elif action == "onm":
            staff_id = self.get_body_argument("staff_id")
            month = self.get_body_argument("m_month")
            result = session.query(orm.ATTENDANCE.m_month, orm.STAFF_INFO.name, orm.STAFF_INFO.id, orm.ATTENDANCE.leave_time, orm.ATTENDANCE.late_time, orm.ATTENDANCE.absent_time).filter(orm.and_(orm.ATTENDANCE.staff_id==staff_id, orm.STAFF_INFO.id == orm.ATTENDANCE.staff_id, orm.ATTENDANCE.m_month==month)).order_by(orm.ATTENDANCE.m_month, orm.STAFF_INFO.name).all()
        session.close()

        if result != None:
            data = dict()
            j = 0;
            for i in result:
                data[str(j)] = dict(m_month=i[0], staff_name=i[1], staff_id=i[2], leave_time=i[3], late_time=i[4], absent_time=i[5])
                j = j+1
            self.write(data)
        else:
            self.write(None)


    def put(self):
        session = orm.DBSession()
        action = self.get_body_argument("action")
        m_month = self.get_body_argument("m_month")
        staff_id = self.get_body_argument("staff_id")
        leave_time = self.get_body_argument("leave_time")
        late_time = self.get_body_argument("late_time")
        absent_time = self.get_body_argument("absent_time")

        if action == 'update':
            try:
                result = session.query(orm.ATTENDANCE).filter(orm.and_(orm.ATTENDANCE.staff_id==staff_id, orm.ATTENDANCE.m_month==m_month)).one()
                result.leave_time = leave_time
                result.late_time = late_time
                result.absent_time = absent_time

                session.commit()
            except:
                self.write(dict(result=0, msg="更新出勤信息失败!"))
            else:
                self.write(dict(result=1, msg="更新出勤信息成功!"))

            session.close()

        elif action == 'add':
            elm = orm.ATTENDANCE(staff_id=staff_id, m_month=m_month, leave_time=leave_time, late_time=late_time, absent_time=absent_time)
            try:
                session.add(elm)
                session.commit()
            except:
                self.write(dict(result=0, msg="添加出勤信息失败!"))
            else:
                self.write(dict(result=1, msg="添加出勤信息成功!"))

            session.close()
    def delete(self):
        session = orm.DBSession()

        staff_id = self.get_body_argument("staff_id")
        m_month = self.get_body_argument("m_month")

        try:
            result = session.query(orm.ATTENDANCE).filter(orm.and_(orm.ATTENDANCE.staff_id==staff_id, orm.ATTENDANCE.m_month == m_month))
            result.delete()
            session.commit()
        except:
            self.write(dict(result=0, msg="删除出勤信息失败!"))
        else:
            self.write(dict(result=1, msg="删除出勤信息成功!"))

        session.close()

class SalaryHandler(web.RequestHandler):
    def post(self):
        session = orm.DBSession()
        action = self.get_body_argument("action")
        data = dict()
        j = 0
        if action == "get":
            action2 = self.get_body_argument("action2")
            result = None
            if action2 == "op":
                profession_id = self.get_body_argument("profession_id")
                result = session.query(orm.SALARY.staff_id, orm.STAFF_INFO.name, orm.SALARY.m_month, orm.SALARY.salary, orm.STAFF_INFO.profession_id).filter(orm.STAFF_INFO.profession_id == profession_id, orm.SALARY.staff_id == orm.STAFF_INFO.id).order_by(orm.STAFF_INFO.name, orm.SALARY.staff_id, orm.SALARY.m_month).all()
            elif action2 == "oname":
                staff_id = self.get_body_argument("staff_id")
                result = session.query(orm.SALARY.staff_id, orm.STAFF_INFO.name, orm.SALARY.m_month, orm.SALARY.salary, orm.STAFF_INFO.profession_id).filter(orm.SALARY.staff_id == staff_id, orm.SALARY.staff_id == orm.STAFF_INFO.id).order_by(orm.STAFF_INFO.profession_id, orm.STAFF_INFO.name, orm.SALARY.staff_id, orm.SALARY.m_month).all()
            elif action2 == "omonth":
                m_month = self.get_body_argument("m_month")
                result = session.query(orm.SALARY.staff_id, orm.STAFF_INFO.name, orm.SALARY.m_month, orm.SALARY.salary, orm.STAFF_INFO.profession_id).filter(orm.SALARY.staff_id == orm.STAFF_INFO.id, orm.SALARY.m_month == m_month).order_by(orm.STAFF_INFO.profession_id, orm.STAFF_INFO.name, orm.SALARY.staff_id, orm.SALARY.m_month).all()
            elif action2 == "onm":
                staff_id = self.get_body_argument("staff_id")
                m_month = self.get_body_argument("m_month")
                result = session.query(orm.SALARY.staff_id, orm.STAFF_INFO.name, orm.SALARY.m_month, orm.SALARY.salary, orm.STAFF_INFO.profession_id).filter(orm.SALARY.staff_id == staff_id, orm.SALARY.staff_id == orm.STAFF_INFO.id, orm.SALARY.m_month == m_month).order_by(orm.STAFF_INFO.profession_id, orm.STAFF_INFO.name, orm.SALARY.staff_id, orm.SALARY.m_month).all()
            else:
                result = session.query(orm.SALARY.staff_id, orm.STAFF_INFO.name, orm.SALARY.m_month, orm.SALARY.salary, orm.STAFF_INFO.profession_id).filter(orm.SALARY.staff_id == orm.STAFF_INFO.id).order_by(orm.STAFF_INFO.profession_id, orm.STAFF_INFO.name, orm.SALARY.staff_id, orm.SALARY.m_month).all()

            for i in result:
                data[str(j)] = dict(staff_id = i[0], name=i[1], m_month=i[2], salary=i[3], profession_id=i[4])
                j = j+1
            data["result"] = 1
            data["msg"] = "数据获取成功!"
            self.write(data)
        elif action == "update":
            #get the base salary
            m_month = self.get_body_argument("m_month")
            action2 = self.get_body_argument("action2")
            base = None
            if action2 == "one":
                s_id = self.get_body_argument("staff_id")
                base = session.query(orm.STAFF_INFO.id, orm.PROFESSION_INFO.salary).filter(orm.and_(orm.STAFF_INFO.id == s_id, orm.PROFESSION_INFO.id == orm.STAFF_INFO.profession_id)).all()
            else:
                base = session.query(orm.STAFF_INFO.id, orm.PROFESSION_INFO.salary).filter(orm.PROFESSION_INFO.id == orm.STAFF_INFO.profession_id).order_by(orm.STAFF_INFO.id).all()   

            for i in base:
                s_id = i[0]
                salary = 0
                b_s = i[1]

                # 然后是获取津贴信息
                al = session.query(orm.ALLOWANCE.staff_id, orm.ALLOWANCE.m_time, orm.OVERTIME_TYPE.salary).filter(orm.and_(orm.ALLOWANCE.staff_id == s_id, orm.ALLOWANCE.m_month==m_month, orm.ALLOWANCE.overtime_id == orm.OVERTIME_TYPE.id)).all()
                for i in al:
                    salary = salary + i[1]*i[2]
                # 计算出勤信息
                at = session.query(orm.ATTENDANCE.staff_id, orm.ATTENDANCE.leave_time, orm.ATTENDANCE.late_time, orm.ATTENDANCE.absent_time).filter(orm.and_(orm.ATTENDANCE.staff_id == s_id, orm.ATTENDANCE.m_month == m_month)).all()
                for i in at:
                    salary = salary - LEAVE_S*i[1] - LATE_S*i[2] - ABSENT_S*i[3]

                if salary < 0:
                    salary = 0
                salary = salary + b_s
                elm = session.query(orm.SALARY).filter(orm.and_(orm.SALARY.m_month == m_month, orm.SALARY.staff_id == s_id)).all()
                if len(elm) == 0:
                    # 表示没有这个人的工资信息没有在里面
                    elm = orm.SALARY(staff_id=s_id, m_month=m_month, salary=salary)
                    try:
                        session.add(elm)
                        session.commit()
                    except:
                        self.write(dict(result=0, msg="提交数据有问题，更新失败!"))
                        return
                else:
                    elm = elm[0]
                    elm.salary = salary
                    session.commit()
            result = session.query(orm.SALARY.staff_id, orm.STAFF_INFO.name, orm.SALARY.m_month, orm.SALARY.salary, orm.STAFF_INFO.profession_id).filter(orm.SALARY.staff_id == orm.STAFF_INFO.id).order_by(orm.STAFF_INFO.profession_id, orm.STAFF_INFO.name, orm.SALARY.staff_id, orm.SALARY.m_month).all()
            #then calculate everyone's salary
            data["result"] = 1
            data["msg"] = "数据更新成功!"
            for i in result:
                data[str(j)] = dict(staff_id = i[0], name=i[1], m_month=i[2], salary=i[3], profession_id=i[4])
                j = j+1
            self.write(data)
        session.close()

class FinalBonus(web.RequestHandler):
    def post(self):
        session = orm.DBSession()
        action = self.get_body_argument("action")
        data = dict()
        if action == "one":
            s_id = self.get_body_argument("staff_id")
            result = session.query(orm.BONUS.staff_id, orm.STAFF_INFO.name, orm.BONUS.bonus).filter(orm.and_(orm.BONUS.staff_id == s_id, orm.BONUS.staff_id == orm.STAFF_INFO.id)).group_by(orm.BONUS.staff_id).all()
        elif action == "all":
            result = session.query(orm.BONUS.staff_id, orm.STAFF_INFO.name, orm.BONUS.bonus).filter(orm.BONUS.staff_id == orm.STAFF_INFO.id).group_by(orm.BONUS.staff_id).all()
        for i in result:
            data[str(i[0])] = dict(staff_id=i[0], name=i[1], bonus=i[2])
        self.write(data)


if __name__ == "__main__":
    settings = dict(
        debug = True,
        template_path = os.path.abspath("./templetes"),
        static_path = os.path.abspath("./statics"),
    )

    app = MainApplication(settings, orm)
    server = httpserver.HTTPServer(app)
    server.listen(8000)
    ioloop.IOLoop.current().start()

