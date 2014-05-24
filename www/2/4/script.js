$(function () {
    var
        g1 = new Gallery($('.slideshow_1'), {
            circle : true
        }),
        g2 = new Gallery($('.slideshow_2'), {
            circle : false
        })
    ;

});

var Gallery = function (box,params) {
    var self = this;

    self.box = $(box);
    self.items = self.box.find('.slideshow__frame_item');
    self.nav_l = self.box.find('.slideshow__frame_arrow_left');
    self.nav_r = self.box.find('.slideshow__frame_arrow_right');
    self.menu = self.box.find('.slideshow__menu_item');
    self.loader = self.box.find('.slideshow__frame_loader');
    self.img = self.box.find('.slideshow__frame_img');


    self.circle = (params && params.circle) || false;

    self.count = self.items.length;
    self.cur = 0;
    self.last = self.count - 1;
    self.proc = false;

    self.init();
};

/**
 * Инициализация событий
 */
Gallery.prototype.init = function () {
    var self = this;

    self.nav_r.click(function(){
        self.setItem(self.cur + 1);
    });
    self.nav_l.click(function(){
        self.setItem(self.cur - 1);
    });

    self.menu.each(function (i) {
        $(this).find('a').click(function (e) {
            e.preventDefault();
            e.stopPropagation();

            self.setItem(i);
        });
    });

    self.checkLR();
};

/**
 * Установка конкретного эл-та
 * @param i
 */
Gallery.prototype.setItem = function (i) {
    var self = this;

    if(self.proc) return;

    var next = self.check(i);
    if(next == null || next == self.cur) return;

    self.proc = true;

    var
        el = self.items.eq(next),
        cur_el = self.items.eq(self.cur)
    ;

    self.loaderHide();

    self.img.fadeOut();

    cur_el
        .fadeOut()
        .queue(function () {

            self.loaderShow();

            self.img
                .html('')
                .addClass('slideshow__frame_img_loading')
            ;

            var src = self.menu.eq(next).find('a').attr('href');
            var img = $('<img src="'+ src +'"/>');

            img
                .load(function () {
                    self.loaderHide();
                    _show();
                })
                .appendTo(self.img)
            ;

            $(this).dequeue();
        })
    ;

    function _show(){
        self.img.fadeIn();

        el
            .fadeIn()
            .queue(function(){
                self.cur = next;

                self.checkLR();

                self.proc = false;

                self.items.removeClass('slideshow__frame_item_active');
                el.addClass('slideshow__frame_item_active');

                self.menu
                    .removeClass('slideshow__menu_item_active')
                    .eq(self.cur)
                        .addClass('slideshow__menu_item_active')
                ;

                $(this).dequeue();
            })
        ;
    }
};

/**
 * Проверка показа стрелок
 */
Gallery.prototype.checkLR = function () {
    var self = this;

    self.nav_l.toggleClass('slideshow__frame_arrow_disabled',!(self.circle || self.cur > 0));
    self.nav_r.toggleClass('slideshow__frame_arrow_disabled',!(self.circle || self.cur < self.last));
};


/**
 * Проверка номера эл-та
 * @param {Number} i
 * @return {Number}
 */
Gallery.prototype.check = function (i) {
    var self = this;

    if(self.circle){
        if(i < 0) return self.last;
        if(i > self.last) return 0;
    } else {
        if(i < 0 || i > self.last) return null;
    }
    return i*1;
};

/**
 * Позаказть лоадер
 */
Gallery.prototype.loaderShow = function () {
    this.loader.show();
    this.img.addClass('slideshow__frame_img_loading');
};


/**
 * Спрятать лоадер
 */
Gallery.prototype.loaderHide = function () {
    this.loader.hide();
    this.img.removeClass('slideshow__frame_img_loading');
};


