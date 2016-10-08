create database m_salary DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
create table bonus(staff_id int(4) not null, bonus int(4), foreign key(staff_id) references `staff_info`(`id`) ON DELETE CASCADE ON UPDATE CASCADE);

create trigger bonus_tg1
after insert on salary
for each row
begin
set @sum = (select bonus from bonus where staff_id = new.staff_id);
set @sum = @sum + new.salary/12;
update bonus set bonus=@sum where staff_id=new.staff_id;
end//

create trigger bonus_tg2
after update on salary
for each row
begin
set @sum = (select bonus from bonus where staff_id = new.staff_id);
set @sum = @sum - old.salary/12 + new.salary/12;
update bonus set bonus=@sum where staff_id=new.staff_id;
end//

create trigger staff_tg1
after insert on staff_info
for each row
begin
insert into bonus values(new.id, 0);
end//