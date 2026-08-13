export interface MangaChapter {
  id: string;
  number: string;
  title: string;
  releaseDate: string;
  pages: {
    id: string;
    imageUrl: string;
    storyboard: string;
    dialogues: { character: string; text: string; position: "top" | "middle" | "bottom" }[];
    soundEffects?: string[];
  }[];
}

export interface Manga {
  id: string;
  title: string;
  alternativeTitle: string;
  synopsis: string;
  coverUrl: string;
  bannerUrl: string;
  rating: number;
  views: string;
  status: "Ativo" | "Finalizado";
  type: "Manhwa" | "Mangá" | "Manhua";
  author: string;
  artist: string;
  releaseYear: number;
  genres: string[];
  chapters: MangaChapter[];
}

const CHAPTER_1_URLS = `https://cmdxd98sb0x3yprd.mangadex.network/data/29bdfe0c6a8d8209c5d6b9e1b0f5b020/1-d4e38ef2fa6663d882569f6b3d152b36ab4124790152df1c99a5198ddb338c03.jpg
https://cmdxd98sb0x3yprd.mangadex.network/data/29bdfe0c6a8d8209c5d6b9e1b0f5b020/2-5a5ff77da6b41d7b40a8a4d422f5caa8c1dd3d38ffbc07b8553510dc05c2cca0.jpg
https://cmdxd98sb0x3yprd.mangadex.network/data/29bdfe0c6a8d8209c5d6b9e1b0f5b020/3-4887f47ef8a642ead3566ac1d76d65aacd41b9235414d33d76972bc5c6c016ea.jpg
https://cmdxd98sb0x3yprd.mangadex.network/data/29bdfe0c6a8d8209c5d6b9e1b0f5b020/4-0de564eed69db17b45562244c4911d8ca55f542c0d032fd422bc51b3dcf67546.jpg
https://cmdxd98sb0x3yprd.mangadex.network/data/29bdfe0c6a8d8209c5d6b9e1b0f5b020/5-f5061b5477b2f2210f4a923a833ef214896ddfa864d07288469ec287728f53dc.jpg
https://cmdxd98sb0x3yprd.mangadex.network/data/29bdfe0c6a8d8209c5d6b9e1b0f5b020/6-5ebbfa54979a2dd1e067e3ac205cff50f020f17fd7430349983d705c8f556947.jpg
https://cmdxd98sb0x3yprd.mangadex.network/data/29bdfe0c6a8d8209c5d6b9e1b0f5b020/7-211a2b3d2ecaf3ad972c75d16101409a9b37fbaa87b7363eef90c299c4300af7.jpg
https://cmdxd98sb0x3yprd.mangadex.network/data/29bdfe0c6a8d8209c5d6b9e1b0f5b020/8-6b061be314a9ddaf68fa5c16c43cecd4ef60a3423f3b73919fd4c0c9a48512ff.jpg
https://cmdxd98sb0x3yprd.mangadex.network/data/29bdfe0c6a8d8209c5d6b9e1b0f5b020/9-8033ae8c99adbf124adc24c3daf5e13a0c69370a07f20028726d263134de6154.jpg
https://cmdxd98sb0x3yprd.mangadex.network/data/29bdfe0c6a8d8209c5d6b9e1b0f5b020/10-aa6a953b56255c335727ad1fbe7edb8a123e4524a0cd74dbd3a5ca45d3078716.jpg
https://cmdxd98sb0x3yprd.mangadex.network/data/29bdfe0c6a8d8209c5d6b9e1b0f5b020/11-89c274876a04ad0d834a8a042001cf1567ac2a6ab0f61a3e126e9efa5224a47a.jpg
https://cmdxd98sb0x3yprd.mangadex.network/data/29bdfe0c6a8d8209c5d6b9e1b0f5b020/12-458ddea3af9d62122a66783f4eb8213ede24ac6a5eb3ade7966e4e865c69a7d5.jpg
https://cmdxd98sb0x3yprd.mangadex.network/data/29bdfe0c6a8d8209c5d6b9e1b0f5b020/13-ec9a838a65416d1564ee926a69795094b10c56e08d8e44c97e5bf71d29a8909b.jpg
https://cmdxd98sb0x3yprd.mangadex.network/data/29bdfe0c6a8d8209c5d6b9e1b0f5b020/14-ff22bb5613e255dc131469c500b10456d42f13050b32aa5b447bd9a1f42178a8.jpg
https://cmdxd98sb0x3yprd.mangadex.network/data/29bdfe0c6a8d8209c5d6b9e1b0f5b020/15-f45e832386ff4d15f3cb9285a53b2409cf1d13757f1a96f31db796d16d32c517.jpg
https://cmdxd98sb0x3yprd.mangadex.network/data/29bdfe0c6a8d8209c5d6b9e1b0f5b020/16-cceea9290f3d8eaa0783e24f22039b2bcd3bde127e8fab1458123fe2adb9ecd1.jpg
https://cmdxd98sb0x3yprd.mangadex.network/data/29bdfe0c6a8d8209c5d6b9e1b0f5b020/17-26ef8397fd7bd455e9fe5307a6571a80f5c81566cd3944d8ab25c9c70e30c694.jpg
https://cmdxd98sb0x3yprd.mangadex.network/data/29bdfe0c6a8d8209c5d6b9e1b0f5b020/18-4e936e9155e5668627c85c75b359e87481137404a793d9fbef36d6833a0cca9c.jpg
https://cmdxd98sb0x3yprd.mangadex.network/data/29bdfe0c6a8d8209c5d6b9e1b0f5b020/19-8fa0409180c381de51b0de5460bfa1badab1f855d3304c1d292b7e559f370d92.jpg
https://cmdxd98sb0x3yprd.mangadex.network/data/29bdfe0c6a8d8209c5d6b9e1b0f5b020/20-0ec2ce3ad629c73bab8423d570b3e34151f7db4e4a7c912719f8e95f4d6c6275.jpg
https://cmdxd98sb0x3yprd.mangadex.network/data/29bdfe0c6a8d8209c5d6b9e1b0f5b020/21-27a21543964de9483d9c9bd70b4fc8f1144fc0f61804d659df9de6c7d342f6e3.jpg
https://cmdxd98sb0x3yprd.mangadex.network/data/29bdfe0c6a8d8209c5d6b9e1b0f5b020/22-2c5f3af288ca4dda084c6e2adfb0236904c7794a0c147b5711f98fd1a1f72d40.jpg
https://cmdxd98sb0x3yprd.mangadex.network/data/29bdfe0c6a8d8209c5d6b9e1b0f5b020/23-67305ff2c01a24edf29ac908bfbc1bf1c421e98e601a00523b27da305a15b34c.jpg
https://cmdxd98sb0x3yprd.mangadex.network/data/29bdfe0c6a8d8209c5d6b9e1b0f5b020/24-0ec15e6bd8fede81372ab39a524700d3ec71a86ec2b47ef0a6dc72ca47cc2dee.jpg
https://cmdxd98sb0x3yprd.mangadex.network/data/29bdfe0c6a8d8209c5d6b9e1b0f5b020/25-784cfbc1d751a27ce60e62f8c43e237b88a856c9df0e107e2fb4f0d1bbb92c14.jpg
https://cmdxd98sb0x3yprd.mangadex.network/data/29bdfe0c6a8d8209c5d6b9e1b0f5b020/26-2a0ce401d2908adc8036dbc2684657e08d74d84a9ca78fcc7fb96f30459c4269.jpg
https://cmdxd98sb0x3yprd.mangadex.network/data/29bdfe0c6a8d8209c5d6b9e1b0f5b020/27-30fb9356eaa10cd6a0e16a7c16d1da71ed5c1eb46b51b4e802d9f4240635a2f6.jpg
https://cmdxd98sb0x3yprd.mangadex.network/data/29bdfe0c6a8d8209c5d6b9e1b0f5b020/28-d58603e5552f8c0f6321abf7ee0aa5ca427933f00844637a224c7510e64fd580.jpg
https://cmdxd98sb0x3yprd.mangadex.network/data/29bdfe0c6a8d8209c5d6b9e1b0f5b020/29-7b28beb7572bc15b55142136e7c88f8dee472383ee6b9b6d93562acac4b2f313.jpg
https://cmdxd98sb0x3yprd.mangadex.network/data/29bdfe0c6a8d8209c5d6b9e1b0f5b020/30-0b6fa7d58eefcd7fedb1d96ff3826b2bf114e380585ff939e83336e21de11a08.jpg
https://cmdxd98sb0x3yprd.mangadex.network/data/29bdfe0c6a8d8209c5d6b9e1b0f5b020/31-6b1e48e08ace8aee82bae70825dea4fdf3adb4a3998da5aeb4582c74635bb6bd.jpg
https://cmdxd98sb0x3yprd.mangadex.network/data/29bdfe0c6a8d8209c5d6b9e1b0f5b020/32-dd394fec76e346cd8939f2a09884c374459e01a1c150ea5d0a65411ae19f4502.jpg
https://cmdxd98sb0x3yprd.mangadex.network/data/29bdfe0c6a8d8209c5d6b9e1b0f5b020/33-e22ecd241c643d15f5148eeb4a668ec7a555bb6a95dda0899d84ee92091aecc9.jpg
https://cmdxd98sb0x3yprd.mangadex.network/data/29bdfe0c6a8d8209c5d6b9e1b0f5b020/34-f8ec3fbb6a1bcdc7f1ae197c81c1d073edbbc9ed55cfb473ce9a9965f0062e39.jpg`.trim().split("\n");

const chapterOnePages: MangaChapter["pages"] = CHAPTER_1_URLS.map((imageUrl, index) => ({
  id: `daredemo-c1-p${index + 1}`,
  imageUrl,
  storyboard: "",
  dialogues: []
}));

export const MOCK_MANGAS: Manga[] = [
  {
    id: "daredemo-dakeru-kimi-ga-suki",
    title: "Daredemo Dakeru Kimi ga Suki",
    alternativeTitle: "Você Que Faz Sexo Com Qualquer Um",
    synopsis: "Uma Gal safada que deixa todo mundo transar com ela e um garoto virgem do ensino médio apaixonado por ela, mesmo depois de vê-la transar com seu colega de classe.",
    coverUrl: CHAPTER_1_URLS[0],
    bannerUrl: "https://i.8upload.com/image/64f36817a74d8291/155-sem-t-tulo-20260730170652.png",
    rating: 6.18,
    views: "0",
    status: "Ativo",
    type: "Mangá",
    author: "MangaDex",
    artist: "Kokoro scans",
    releaseYear: 2026,
    genres: ["Maduro", "Romance", "Comédia", "Drama", "Gyaru", "Slice of Life"],
    chapters: [
      {
        id: "97ba9b98-91ad-41fa-8331-5ef28aa19c5b",
        number: "Capítulo 1",
        title: "Você Que Faz Sexo Com Qualquer Um",
        releaseDate: "30/07/2026",
        pages: chapterOnePages
      }
    ]
  }
];
