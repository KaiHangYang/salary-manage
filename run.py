# -*- coding: utf-8 -*-
from tornado import (
    ioloop,
    web,
    httpserver,
    template,
)
import orm
import os

class MainApplication(web.Application):
    def __init__(self, settings, db_engine):
        route = [
            [r'/', MainHandler],
            [r'/pro', ProfessionHandler],
            [r'/overtime', OvertimeHandler],
            [r'/staff', StaffHandler],
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
                session.close()
            except:
                self.write(dict(result=0, msg="填充数据有问题!"))
            else:
                self.write(dict(result=1, msg="添加完成!"))
        
        
    #delete 用于删除数据
    def delete(self):
        p_id = self.get_body_argument("id")
        session = orm.DBSession()
        elm = session.query(orm.PROFESSION_INFO).filter_by(id=p_id)
        try:
            elm.delete()
            session.commit()
            session.close()
        except:
            self.write(dict(result=0, msg="删除失败!"))
        else:
            self.write(dict(result=1, msg="删除成功!"))
        

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
                session.close()
            except:
                self.write(dict(result=0, msg="填充数据有问题!"))
            else:
                self.write(dict(result=1,msg="修改完成!"))

        elif action == "add":
            elm = orm.OVERTIME_TYPE(name=name, salary=salary)
            try:
                session.add(elm)
                session.commit()
                session.close()
            except:
                self.write(dict(result=0, msg="填充数据有问题!"))
            else:
                self.write(dict(result=1, msg="添加数据成功!"))

    def delete(self):
        p_id = self.get_body_argument("id")
        session = orm.DBSession()
        elm = session.query(orm.OVERTIME_TYPE).filter_by(id=p_id);

        try:
            elm.delete()
            session.commit()
            session.close()
        except:
            self.write(dict(result=0, msg="数据删除失败!"))
        else:
            self.write(dict(result=1, msg="数据删除成功!"))


class StaffHandler(web.RequestHandler):
    def post(self):
        session = orm.DBSession()
        staff_result = session.query(orm.STAFF_INFO).all()
        pro_result = session.query(orm.PROFESSION_INFO.id, orm.PROFESSION_INFO.name).all()
        data = dict(staff=dict(), pro=dict())
        for i in staff_result:
            data["staff"][i.id] = dict(id=i.id, name=i.name, gender=i.gender, profession_id=i.profession_id)

        for i in pro_result:
            data["pro"][i.id] = dict(id=i.id, name=i.name)

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
                session.close()
            except:
                self.write(dict(result=0, msg="填充数据有问题!"))
            else:
                self.write(dict(result=1, msg="更改员工成功!"))
        elif action == "add":
            elm = orm.STAFF_INFO(name=name, gender=gender, profession_id=profession_id)

            try:
                session.add(elm)
                session.commit()
                session.close();
            except:
                self.write(dict(result=0, msg="填充数据有问题!"))
            else:
                self.write(dict(result=1, msg="添加员工成功!"))
    def delete(self):
        session = orm.DBSession()
        p_id = self.get_body_argument("id")
        elm = session.query(orm.STAFF_INFO).filter_by(id=p_id)

        try:
            elm.delete()
            session.commit()
            session.close()
        except:
            self.write(dict(result=0, msg="员工删除失败!"))
        else:
            self.write(dict(result=1, msg="员工删除成功!"))

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

