  create or replace function public.sincronizar_email_perfil()
  returns trigger
  language plpgsql
  security definer
  set search_path = ''
  as $$
  begin
    update public.perfiles
    set email = new.email
    where id = new.id;
    return new;
  end;
  $$;

  create trigger sincronizar_email_perfil
  after update of email on auth.users
  for each row
  when (new.email is distinct from old.email)
  execute function public.sincronizar_email_perfil();
