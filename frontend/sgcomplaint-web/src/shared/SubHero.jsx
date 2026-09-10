import { useSearchParams } from 'react-router-dom';

/**
 * 서브 페이지 상단 이미지.
 *
 * fragments/public-layout.html 의 subHero(imagePath, title) 프래그먼트와
 * 같은 마크업·클래스를 쓴다. Thymeleaf에서는 각 화면이 파라미터로 이미지와
 * 제목을 넘겼는데, SPA에서는 경로를 보고 결정한다.
 */
export default function SubHero({ pathname }) {
  const [params] = useSearchParams();
  const hero = resolve(pathname, params.get('category'));
  if (!hero) return null;

  return (
    <section className="subpage-hero" aria-label={`${hero.title} 페이지 상단 이미지`}>
      <img src={hero.image} alt="노란 버스와 시민이 함께 있는 거리 풍경" />
      <div className="subpage-hero-shade" aria-hidden="true" />
      <div className="subpage-hero-copy">
        <h1>{hero.title}</h1>
      </div>
    </section>
  );
}

const CATEGORY_HERO = {
  PRAISE: { image: '/images/subpages/praise-hero.png', title: '칭찬합니다' },
  COMPLAINT: { image: '/images/subpages/inconvenience-hero.png', title: '불편합니다' },
  LOST: { image: '/images/subpages/lost-property-hero.png', title: '분실물 문의' },
};

function resolve(pathname, category) {
  if (pathname.startsWith('/complaints/new')) {
    return CATEGORY_HERO[category] ?? {
      image: '/images/subpages/complaint-write-hero.png',
      title: '민원 접수',
    };
  }
  if (pathname.startsWith('/complaints')) {
    return CATEGORY_HERO[category] ?? {
      image: '/images/subpages/complaints-all-hero.png',
      title: '고객의 소리',
    };
  }
  if (pathname.startsWith('/mypage')) {
    return { image: '/images/subpages/signup-hero.png', title: '마이페이지' };
  }
  if (pathname.startsWith('/account')) {
    return { image: '/images/subpages/signup-hero.png', title: '회원가입' };
  }
  return null;
}
