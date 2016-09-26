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
            elm.name = p_name
            elm.level = p_level
            elm.salary = p_salary
            try:
                session.commit()
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

