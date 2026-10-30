// Homepage photos. To change a picture, replace the file in public/images/home/
// with a new one of the same name (JPG, portrait for hero/categories, about 1600px
// wide, under 500 KB). No code change is needed.
const home = (name: string) => `/images/home/${name}`;
export const homeImages = {
  // Top slideshow: three panels, left to right. Each panel swaps to its "b" photo.
  hero: [home("hero-1.jpg"), home("hero-2.jpg"), home("hero-3.jpg")],
  heroSecond: [home("hero-1b.jpg"), home("hero-2b.jpg"), home("hero-3b.jpg")],
  // "Shop by occasion" tiles and the two big Women / Formals banners.
  categoryWomen: home("category-women.jpg"),
  categoryFormals: home("category-formals.jpg"),
  categoryMen: home("category-men.jpg"),
  categoryKids: home("category-kids.jpg"),
  // Wide festive banner ("Dressed for every celebration").
  banner: home("banner.jpg"),
  // "Our craft" section: close-up of embroidery.
  craft: home("craft.jpg"),
};
