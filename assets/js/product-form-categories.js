import { supabase } from './supabase.js';
if (document.body.dataset.page === 'admin-product-form' && supabase) {
  const mount = async () => {
    const select = document.querySelector('#product-create-form [name="category_id"]'); if (!select || select.dataset.hierarchical) return;
    const { data, error } = await supabase.from('categories').select('id,name,parent_id').is('deleted_at',null).eq('is_active',true).order('name'); if (error) return;
    const parents = new Map(data.filter(item=>!item.parent_id).map(item=>[item.id,item])); const children=data.filter(item=>item.parent_id);
    if (!children.length) return;
    select.innerHTML='<option value="">เลือกหมวดหมู่</option>'+[...parents.values()].map(parent=>{const group=children.filter(item=>item.parent_id===parent.id);return group.length?`<optgroup label="${parent.name}">${group.map(item=>`<option value="${item.id}">${item.name}</option>`).join('')}</optgroup>`:''}).join('');
    select.dataset.hierarchical='true';
  };
  new MutationObserver(()=>mount()).observe(document.documentElement,{childList:true,subtree:true}); mount();
}
