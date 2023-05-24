function refreshPagination(page,show_pagination=false){if(!show_pagination){document.querySelector('#articles-pagination').style.display="none";document.querySelector('.articles-grid-form .search-options').style.display="none";return;}else{document.querySelector('#articles-pagination').style.display="flex";document.querySelector('.articles-grid-form .search-options').style.display="flex";}
let pagination_links="";if(search.total_count>search.posts_per_page){let nb_pages=Math.ceil(search.total_count/search.posts_per_page);let hide_numbers=false;let numbers_to_display=[];if(nb_pages>10){hide_numbers=true;numbers_to_display.push(1);let min=(page-3<2)?2:page-3;let max=(page+3>nb_pages-1)?nb_pages-1:page+3;for(a=min;a<=max;a++){numbers_to_display.push(a);}
numbers_to_display.push(nb_pages);}
let has_dots=false;for(i=1;i<=nb_pages;i++){if(!hide_numbers||numbers_to_display.indexOf(i)!=-1){pagination_links+=`<a href="javascript:goToPage(${i})" class="pagination-link ${(i == page ? 'selected' : '')}">${i}</a>`;has_dots=false;}else{if(!has_dots){pagination_links+=`<span class="dots">...</span>`;has_dots=true;}}}}
document.querySelector('#articles-pagination').innerHTML=pagination_links;}
function goToPage(page){search.page=page;filterPosts();}
function filterPosts(evt=null){if(evt){evt.preventDefault();}
let search_input=document.querySelector('#articles-grid-input');if(search_input){search.search=search_input.value.trim();if(search.search!=search.last_search){search.page=1;}
search.last_search=search.search;}
let search_order=document.querySelector('input[name="order"]:checked');if(search_order){search.orderby=search_order.value;}
let search_display=document.querySelector('input[name="display"]:checked');console.log(search_display);if(search_display){search.display=search_display.value;}
getPosts(true);}
function resetFilters(){search.search=null;search.page=1;getPosts(true);jQuery('#filter-list .filter a').each(function(){jQuery(this).removeClass('active');});jQuery('#cancel-filter').hide();lazyLoadPosts();}
function getPosts(show_pagination=false,add_to_current=false){let before_html=document.querySelector('#post-list').innerHTML;let loading_html='';for(i=0;i<search.posts_per_page;i++){loading_html+='<div class="post-block loading"></div>';}
if(!add_to_current){document.querySelector('#post-list').innerHTML=loading_html;}else{let current_html=document.querySelector('#post-list').innerHTML;document.querySelector('#post-list').innerHTML=current_html+loading_html;}
let params=[`per_page=${search.posts_per_page}`,'_embed=1'];if(search.page){params.push(`page=${search.page}`);}
if(search.search){params.push(`search=${search.search}`);if(search.orderby){params.push(`orderby=${search.orderby}`);}}
if(search.cat_id){params.push(`categories=${search.cat_id}`);}
let url=`${base_url}?${params.join('&')}`;$.get(url,(data,status,request)=>{search.total_count=parseInt(request.getResponseHeader("X-WP-Total")||"0");search.data=data;refreshPagination(search.page,show_pagination);let post_list=generatePosts(data,show_pagination,add_to_current);if(add_to_current){document.querySelector('#post-list').innerHTML=before_html+post_list;}else{document.querySelector('#post-list').innerHTML=post_list;}
if(add_to_current){displayed_posts+=data.length;}else{displayed_posts=data.length;}});}
function generatePosts(list,show_pagination=false,add_to_current=false){let html='';let index=1;const lang='fr-FR';const date_options={year:'numeric',month:'short',day:'numeric'};list.forEach(post=>{let post_html='';let featured_media=(post._embedded&&post._embedded['wp:featuredmedia']&&post._embedded['wp:featuredmedia'].length)?post._embedded['wp:featuredmedia'][0]:null;let img_url=featured_media?featured_media.source_url:'';let author=(post._embedded&&post._embedded['author']&&post._embedded['author'].length)?post._embedded['author'][0]:null;let author_name=author?author.name:'';let date=new Date(post.date);let display_date=date.toLocaleDateString(lang,date_options);let categ_id=post.categories.length?post.categories[0]:false;let category=null;if(typeof post._embedded!="undefined"&&typeof post._embedded['wp:term']!="undefined"){post._embedded['wp:term'].forEach(term=>{term.forEach(item=>{if(item.taxonomy=="category"&&item.id==categ_id){category=item;}});});}
let categ_name=category?category.name:"Sans catégorie";let categ_slug=category?category.slug:"";let post_content=post.content.rendered;post_content=post_content.replace(/\[.*\]/gi,"",post_content);let content_div=document.createElement('div');content_div.innerHTML=post_content;post_content=content_div.innerText.trim();post_content=(post_content.length>180)?(post_content.substring(0,177)+"..."):post_content;if(index==1&&search.page==1&&!add_to_current&&false){post_html=`<a href="${post.link}" class="post-block spotlight"
                            style="background-image: url(${img_url})">
                            <div><!-- Spacing !--></div>
                            <div class="content-block">
                                <p class="date">${display_date}</p>
                                <br/>
                            </div>
                            <span class="category ${categ_slug}">
                                ${categ_name}
                            </span>
                        </a>`;}else{if(search.display=="list"){post_html=`<a href="${post.link}" class="post-item">
                    <div class="img-container">
                        <div class="img-block" style="background-image: url(${img_url})"></div>
                    </div>
                    <div class="content-block">
                        <span class="category ${categ_slug}">${categ_name}</span>
                        <span class="date">${display_date}</span>
                        <p class="title">${post.title.rendered}</p>
                    </div>
                </a>`;}else{post_html=`<a href="${post.link}" class="post-block">
                                    <div class="img-block"
                                        style="background-image: url(${img_url})">
                                    </div>
                                    <div class="content-block">
                                        <span class="date">${display_date}</span>
                                        <p class="title">${post.title.rendered}</p>
                                    </div>
                                    <span class="category ${categ_slug}">
                                        ${categ_name}
                                    </span>
                                </a>`;}}
if(search.display=="list"){$('#post-list').addClass('articles-list').removeClass('articles-grid');}else{$('#post-list').addClass('articles-grid').removeClass('articles-list');}
index++;html+=post_html;});return html;}
$(document).on('change','input[name="order"], input[name="display"]',function(evt){filterPosts();});$(document).on('click','.emulate-link',function(evt){let url=false;let classes=evt.currentTarget.classList;classes.forEach(class_name=>{if(class_name.match(/url-.*/)){url=class_name.substring(4);url=atob(url);window.location.href=url;return;}});});if(typeof init_pagination!="undefined"&&init_pagination){refreshPagination(search.page,true);}