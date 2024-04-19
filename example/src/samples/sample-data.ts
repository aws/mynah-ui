import { ChatItem, ChatItemBodyRenderer, ChatItemType, MynahIcons, SourceLink } from '@aws/mynah-ui';
import md0 from './sample-0.md';
import md1 from './sample-1.md';
import md2 from './sample-2.md';
import md3 from './sample-3.md';
import md4 from './sample-4.md';
import md5 from './sample-5.md';
import md6 from './sample-6.md';
import md7 from './sample-7.md';
import md8 from './sample-8.md';
import md9 from './sample-9.md';
import md10 from './sample-10.md';
import SampleCode from './sample-code.md';
import { Commands } from '../commands';

export const mynahUIQRImageBase64 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANcAAAD6CAMAAAAFkSJvAAAAVFBMVEUAAAA4ODiCgoLw8PD29vb8/PwhISH///8ICAgUFBRZWVkrKyttbW20tLRERERlZWXIyMh3d3eTk5PS0tLi4uKdnZ3a2tpOTk7q6uqpqam+vr6Li4tMmuJgAAAeR0lEQVR42uxci3asKgwdBRR8i+Lz///zIlGJDM7o3NP23q6TrnZNKyLbQEh2Qh+Pv/JX/spf+VfC/8dyhkn085j/f2Uc68CHrZ9o/D+XQaVPE7Ae4l8gXe/gymj8K2Q4Agva+JdIJfAsVL8FVsxqhCv9NeqK4wYprPw9sGISWFz1L8LFkOUIfxOu5C+uX4GLDFdk28cJ2+6j9iM8gFDvx8Pt+NLajbm+9UVvDeYlrjANLsgIfksWJM26ISZB2aBu2jro89X0lkFSra1Kc3fa5zDwNgv6Cb9UWUD/NWw9843BvMFVXopozE5O+t1XaRfzWlgnky7dRAbNUNhWu2MqDBq6DCJCr2PeH5AYJWSXBiP/MC5wWszbGu1gQZPR8od5+Tgt4QO3rdAzYRO1w6KFcX9MX9XP4TIjho8538eCcMkdPTdzUj72cUvbynpxtN+v8+k/gctMtoQe/bSgM7M12aeo2u+HyYdagYy7F8S/RF9RfSold3BBr12YzEPcyHkO51lWjMikXhfOMCchjN3oixdJklWbndhb0XzOCcvLJAkcfYnsfDDiHq7gPB7rhE9fS496NkabWVDm99heQrgm3yVa8wdfwkAGxkNYXK8GE93ERe7j2pY9RHTe+FtZTXgDJ7gknXn4ajD3cPHPcA2WXxDdKS5kXZDk1mp+Ha4P9cUyZ/t5Co6i077N1hZ136Ev1jVHab24wrVZR+IuiYSRfttrB3w7i1UgiimmXXvwuVjb0TgPhHYcWNt0tbu+zGBa72A+0RdNRIRFzM+4NDLTSOgvM2KAuGqLhKm+tDaI0nrQOA36NET6JGEUla2+pC9nS0+mVwcXLZ3BhB/ri7qsVe3V18MxFkgVo21gtwRW7isJrbrM3BbafdmZhyeD+UhfblfhOS40lhd7fM92JzFzRmKeSIqvxXVRX110xCUaBxd6Bt+JFGAg0DPNeirofsmLi32jvljI8bB5Tc9xGd6rMrN0cZZ250n/3mg0Ub58fIHrO/UV00mGdQSOVxjmK6w2LEdinyH0pbDWP2QXD7JUA6tmucIiYzl3cSfnKiYqSRJhdT/9nL6Qk1FYVXX6pfPQ6isdjjRzZg2LUTiEZrT0rdUf0pcXl7JUq4vLOBUojgQTArEcf43r+/VlWvUWV2hNiIvL9Q8hrpx9thU6+EF9xYofu67v4gr3AA4J4gF+Rl8xlUEgCWumDuOSSxKxQLhIleembz7vScaZ28c3ZYqkhM5+Ul8LxRazWfBIWVwo5wu4mkJsOWA3KQyPZwwzfKtt+Ul92fAJ3HHrCz0QrtrZoh+XaNmf1ddx5QAufsSF0xyuzFdwfaW+6kv6yrnHAmBcznWef7e+Ei6wcM88JEZoTEPBhTSrgpSCL/oClfHUbEQ0QEUih4oRkRG9QLEMZCe3ES53MJ/rizVVVU3ou3NxdTXQzr2irBqbdbGTahyVGrXoH3m7pds8tSRiHseKsjFxmekibN156B/Mh/wGc76PuEj/MkPNMN3kXV/AguTCmZjG9adPPIBvMF/Cb6Dke0+vp0f5ERdzozSvv/H9fBQYB/YaF15f7haQeXFNX8JH0Xu4xHgjne0+eBK+ErTqCi/a3sQVzWcia5fHTvu+zCnN5VZhRXJZreobRtUgfYleS2Huivo+Udr7kjpUm8q+B9zB0iB1eOxXg7nJY9/JO0im8dCMP8Rs0AwJNzz2ottiS4KBvgpCKYW5U1KqWyvx4ImeZtomQrdM/3n+D+VTzEdY68pSU/NuUkBfJkqDoKvcCWLYl/PHnkuTX5dPuY3L9aPcOIU84WLHOMXFhezhT+IyDDUEyQsu7uKiXlyVF5f5azD8YVx1FKXvv0Y3/6VSEeTncSXWV+TgyjotkMqcu24wfRUQfIaXBqOu4BraK0JcXHHbDC/iZfoCF/Dcj/VjWhPdF7k9mD9Yl+LmU17wG+TFPHT9+39VNfjNuOh1XG99lx/CpayHFO523q8vmJIurp7+J3EtzJKARbcw1OBi+fUVS/EjuKqwtBKu2RI6Zmt6fzJBVFCWh1asHeeJkTGbu7hVM7hUEH9FS4tELIQN4GLTXNcm3Z/YqCwqn0XivC6banRpbu7imqLDe4xW28u3tMHkK8Rf6dzwWA79FH+VziLKz3kdI6hGCVV5QFTQ3cP1FBjVlnuWPo72qZU6j7+u4UIfR4dhdtOFN3AlPkMFbutyC0NxJUKYOEyuX1/uM9/ievGO6pvzULq49ho0iPpI4RtAeQWXmG7i8le9racabuKic7DSypF5QDFN1RC3ZVqMMIuaZLvED62mSQn0IttpytHREe366A5YU21LhjbTFCIwpi+UWolS/cQtkqzamITHcWW37TwFR2Vo0o2A1k4gG3bHhQ1tZzQRdEur6HHksKHjMT2cY+LjoD0fUgsegIUdMnE451QsfVV2a4umoV1NP1MpX9xBso5rdTA/3r+gkgbU4bANKP+F6m0eFhe692GjGcOe9uRY5Yb2L7RlR92Rz3B//zO43OS4HxfSl+ss4SjNy0cl57ig2ih3cNUf4zLG4iTpn+2vjCbOgg8tr82dUyO1xZX4TCUqeUC4Rn6s/YCXqu7gAm5522WmlO8EGD36OU2gV10TLyyHaYX0VS8c93jEhbNJolpo6yPzzguAke9PjJqd1wZcim70+dKKl8N1XG1YFEVQFKVal1ObK5WA5Sj67GClhzwf4ibrtXfVjkr1O2P9iHQnRWo9pFQptbLd9dqXlmh5C5FUIPk2yk73VWxPrKsVl+mmgMH1c6tbHQ8avsaFZpR0IhCYS85kZEOwm4HQ6wuBzWHHbC2uQfKSn7VzRG10+i3pPb+3sWvdzYj7c1aTrVuun5ImFhf14eJOFtpdu8jfcHFFzT1ck10T6EW+wKUex6Lr27j8BaazlylCbkt1D1f1Blfanecru9R7NPp8HoK+yGkhJpqHpP8cF8mlzLj7IttRSqhuD/o+q0yrRdZVC0rKpByHuMr6PtjI6r7X61v/MBM7neUmYMbNJShE2i6NB8UtFPfSwVa13dVbX+s5XilzcgnX0PPjBAHqKbUHERY73/arFebl0WfghX6xlMJmXFMtC3dNB3+eqFmu++38bsJMD/j3Nj10xZNLdl65E5/srdG+PDsHE5Sz9N7GKfx8X353fPApTrm0L2fOTaYWEhXQoYMj3AZ8yo1TnASON//F/bhu5wgv+VGlz3dlmaMvxY+mVrlHjYpjkEXO87C3cTFn7+N3z0ktme0EOIou2WIJkbdrmMGF4CZqGLp23m6IaljGVcCjmb7JV4qp7br18LutvymazkjrmMhhq+Ju98E89IcopDdx1VXV0D32q6py45oDxUx+XksbD6boGiqfqqrbTPlQtW/zlY9op7CjXHcG0Sffaq71Y5C9CNM0G+xgYAaptTDgFi7pY3Kf9g1pTUh+M7/s7stoGT+xBWbmh86WfWP/yq7gQrew/gquV3VE57iQRUBV25/hkucFPqMPMj5j13yur576cJXOGRFkUoyrGLWXcXX7CBLiYahXCqL14OIv/tvFO30B2/2EC0X4C+Eh8vhQK8xDdt2PamW2SK2GI3UcNnGrzKVModdETIwU6RtywqZwXuMrmtdZVmZZOAGPXXBodRBj13igW1UL8Z2VkVNolC7drm+rCetpH8zcxIPSl1hez92/yDss1HHqPeCE65ZNq2Znu1FpB8qnuFVw4KC49djIT5K+wUCZQSz58SDjXX6jcHkfHy7gJELLYz92Aou+wBU6NUn8TQgDliqzfNL8MS543aUv4YbqseEpiMd++PKVT+GrfMP3uv8eBPrqbQLtcz7KhEt8PGe7pS3H8OLy6ws48eoNLvd1rrgcUv0tLtZM01Lhd3hLQ5YG2i3qFo56OjoVZP6HtivRchQEglE88MT7yv//5woN0hxGTWbdffMyoyFWQOiurm6CIFz0qMjjq/4ie/O8GcJT7CUnXr2sEPoRRy+NGxm2BrJTA0GqT6wwrJIPdQ9COSkVb+P6ZUnjtzylTLI1oEUXp9GC2VMvLtxfQprNbc+6SWNCcNyh4+w0Wv7z/VfjLsZCWYaKVLesyFNcmhpxlln9bMOSLSYHdNVSWPEUb38hX24mVjxltcI4pVeXp0epy2Kd61J8ISeHRQk1C2Lnw/qfLy/bjbJm7+GyNdHZfT5qPLcPUasf8ny9uDDbPX+Pa/2ejxo0v/GOCBH/IyCNCVMZCwzrbZSaWinw7Odr4PQEZ7vrSbLdiN9Q75U6Pf5xb8x7ohk0JtFo47JJ9Y981DiCeFLwxeqYyyomm6CaFQm1qatmeU3mmzfofl5Q3Ktgu9tBMtSC21KN12A/8k+ccQiwnllHpGGW17VN4QlSvXnKH77oC8cMYJ2IbfZULTTUjS/b4XxRfQTM6Va/k77Ocwb0sltlZ1IBg/S9zfe+zke7Xw/gxQUT6Poy2W6/40K9FDc793HCb/jex7hKLSi2BYs/4EIlR5xry99wZdU5LjvSb3NGgMs3Dj8eMA7jC1z37EM+ObQo10JNHHkV68CUOFodjToOVqXRNk7pEqrJBOJfkBjcs1pWGkLxL+8RgGHDg1xErg74Zupau2r3+ovLqQ0vYZBzsZow1sQMSnZG1kwsVoNkVQFPGa9UosI4Sg31pZlxo4+ol6ptFaqE/jpuhkThw3Ho5bExbpupGH0sCHpX5VW9tda67Ff8l5Y7ZPM2D8ahl8f2m2h+XKE1927U5+M8xpVbIovuYX9ZqgPaev3IK1yZlaTsGHJPcUH/oJvZsm/4eZgyNI+tJMRLzBlqI+/zbQqH5R1vUlO8v2EtaLJ7M6CRUcXUnKss2TTobXJ9amFZNqPvIQZ/6ll/ZesGh+KxBVnN/+f7VNfIk5Cmy3ltTJG3kosuBBct5NXgfcLvslQbuqqAkiPGxySJ41dGfWNG/ncnd82e4XL4Rh3kR5VrNupzaQw9AFWtdyaP46zLoVepBt1xrmN+oCPy4sKk7uTDNdsRcX0qWCznxGtvQBJlfYe3cXC1X+NC+ih0ChmBgaWGQHqA2sqHRUWHbKmAY1R8kAqgRaf7A1yYOo5Laty8Zxy+ZMqU5uepMIvApLJ5bG+qpcuLYjLsNi/KhL3CWoPH3udqbjExxqnjLeQ0N2eoyVoy4J6T/Q9tKX6I6TLLpVq65VftZxKptC5Xwmno3R/rGJuVoLvd5LfVKKU1UNzwiY5P3IRAtVck2u7y2Hr9QnEHxDSB5l0z1M4zYRMPKIYLvcq1pEFv8b2X6xfmIzLp79Hwvn6e+eJECJfDUF/hmhITF6rb8x0uJN56ECfy8lEYV2IqCS9xIR/VrrP0HS40Bz3gozTphPSMCBcKfNzDhXSVdl0sVC/lO1z1ff4w7mqIWte7J9VLewM/XxPbLQd6xLq3QMe66Skuyi2HcNlNDy7oTgrOiTcNqLbLxnMAWS3jlUST6sP+iUd0fbddSG/Vejv3l6NByAwI1xNI+3BAuNKYTFOuhdewxnBtQpOc95fIxItXkdUXDUsaCfNOylO0E3v8oCgOu9VZITUTewNKDTFNQ8Q58aSN7uEyTejQ7i+d4oGoJIfJtftrPMYdLLOVyY2ccFLlsfiClYK0cjqeYsTBb+CC1V8M4TNcrzNcSe/zK1Fdx/AWb1NqsqWzvo3v41/IRYWp1VZP2DeAjMCa+PoLqRTbp7jeFo8dPtfPR3BA+P/Q6WkBXRRjtltcBM7HUTdV8Btmf/FMcpCwVPvLqHyMizdw8NjiZiLJgtzCFW/lPHO94zxn2uqMp1EJHkk3syZdqk4fhz5gGuEPfbq8FcFcqSoCKvNfFAGAxTo8moDVg/GXuaXfaHQDgbpqvxkhsbzvVzbZZ6G0YAaL/iJuK4wnuKqip8lq9+IpjbcgDjKcy4f2hngwbFxDcrqWOo5R58Nl6w+f4KJal1f9qD/04wpv4Xr78lNwBuFgsVaVhSv0MWBQEmH9kY9yxiEfYUlzJfhgx2RP5lNcyMMX2g+IunSWax1ZtwRzLVrK2tv+F+U1gQKhXsTeatRUXG9Y50rQ06ye7ZqiZlVXLdU6pT2vWgSWBG9V/g/qererplWRMftVJTy1b6DHgzqvUsIbGEIoeyTeWJeTkmrvv9/nsZlMdSFEzPO4v6Iyo7ziATmyzLJX5hTfJCx7FZW4al8NaLHxKlPwlNeLQVYLTjw71GIRZjyzim+ssOR7A1VqFJhC8Usi5nn6kLdxqGMxA6D+EwPfKXct1k54l7euiE1POHJAVFdk9Bvtv/FRAhe18x0cz+oDj80sPcDs1RG9fbjgY1rLX/J7M+2P/WXjEo+uE5JHV3WacGx9yni/X4nqilz1F3z19/XY4iuKai+uTW/soRhqY9ePUuNaWEbrPo33N0xzpjlxuKdlAfqpXRbzzt8JhcIlKdmf6GATDWjdD66S2AQ0a8lXuBZL3yuyblWIb5t4vUpcabLIUK9GzbbwSpTz7gA2Bg0dr7VK5t0bDEJiMtTDMbfyBvKilg/hxjOLcVXLZevv+ZVX49DRg4zeaGxvrkzOzmm2ufZhoRcLIDywQ+BJMU3/Dhd61uP5gt/oM9+kF16YNX6V4va9juhqPvygx8bW8nIRr+xu5euh5WT8UUd0q78QdezFRd/pBS6Lx/5EwgsPoh7+BJeeNxK9ywcgmBlT1HFUha2sj50fdT72VyXmnjGuZQxXeWoK4VqWiwaysg1X+RWSMTTIazIyWcnExkXzth2Hr/rLydlCDHVr8jae7UNMXHyLGBl38N4JmFRLbnb4Bz2b4Kbq4U9wNb4Q+odafojfqKjnWUd3IqW+9NTIWL2cwcM4UZSf5tg5c3V9jgvpAUZt+aE7QW4Iqju33cf1NF7ZnSaSOFKOD7jEVfD1wz4j9gyBFkC7nt6f44Idk8Lg2P5CvRDUsWCapyhtZkVeB03THxPnUYaMb1XCryoEJ76/YQ2SukmjSTSgrop4SB26/r033QtNOx1lglmPyO3+iNSrjLNHPAA98pPJNPWcoeY/evFzv81altDNe77zCa8RRV+8uK6sOxfxsnHwbZM24doErpkeWJawJV0msptFsMtKUqs+2T+m4+QxhRq96KV9iFPdfi98lxUoE/xV3Dy2JjdjNhGKV7R+gbEknicYraOW9bc6VzP3mUHVuZ7N+eNq6Yhu4Sr98TI9CXqV1ijl960Hstf/wmz35MNFLyhTB9etcdhdWGso+gSecG3l66E6gaElmmfaQLG5yT57iAvRd7f6a6iBhj49VrVqceIhjomNC/mVom4qPHVNAUHlGDWQjFgWlH0cfA4ucugJ7/Eb6bJ2/adKfXEzQpHZKR3eiu1+efsrHcauPyjucUqnVuzqJhto8MdEWyer14KDwKyatoWVCc4rFLzbH+sRnXjhOdYLefrLoSPq19kWWn7eJvW5Q8jv/7Ue0SfH6HX+fKU+yWXWfIMr+oCr/WNcjRdXd84h/YDL318QHw7/GJddnw3meWEs+TVogsCayd/1lxgcBql+Hida7xwwzKY2kAw1HO06NlFa5XV44iU2eVDu0021udjiSbXNBOW9SXF4NaVajw3HKuevbeAU96ETv1qX6Y1D74OwIH95N2uyfEnjD4QfiXmVKbMWCPRSwo29QwoAuBYGPLanv6LWJNUfxlNOjvGcB+iuZtHZd1XvDQZpXtTBJaJiLivyZ7hIfZr7fsI9F3dyQmhj8tgOru4bfuMBLqnU/bW/pov+cubD91e4svPDxjXMFOVyZrszgne51o8aUTthc+5Z1VTT+2WPiaHyhrmV71lSbPbzNe5NEVj+K7I8eb6Cpj87KmdfGL6jEmgMw6ri8+FcFAe1rRhq0tXwBz4fborSHtixq3Y8VdW68t2YGCq9ISKJFq5XctDlvJTlfG8+fLC/A/bl9Xd8qKQopoa1s4+IBGe/7FvrF26d2oPxL/bjcHBVWopzpce2GeoH9sZ3eW0P9k+xyTQU9MJ6bHKqhbT3y37SX9/wNs/7S8Q8oGqfFfOglh7b2Dew9YVaHvdX+6y/ojE0j8rGFW3vMOQ7OPa7K8bGJW067mSFeQ7yqSLPGTDS0F9ZnudK5r2MvIr2yFpeRVu0onhsGMhMf67YKDJRDcijeD3T26D9pKwt75x9sjSPLXVFXPcFIQl/HTPEMg5m1XPp+EY+2tIO08TxN7zNg/3a0FqKqClvfTan/oa9GwmaUrpzfgNxqu8vxuHz/Xxrb12RD/2lvU/MY1cH5P+C6/l+vm+tlmUPcE0mDtBL2SbwJ1yv2zrYZ/3FPZMskwXGFp7t8Zq5VbJm/CU7rJSG19VXuPju00wUgZV0eSH532o/NcXpGnBml0LbB9NriZrewqfhNPM7+vv+2v+FvZJ6Ay6qbsPgogXjDLgmlsD5gy0Y1EbiA0uSkqRkN9dE9dtc22+8nJMpTuC7aq99v9y3Dx89X9796E/q3Ebm8+TkV7bHmLbzAmD9ssfhU3v+yfPlx3VeD9ZfVwT5cqju91We70NcX/aXs0GBFxdK3LFDYRBJLON/7V2LdqMgEAUSKQ8FpXGt8v//uTNoDKLm0SZ7Nj3ck5PWmKiXARyHeWzwGkUZpSYKmps+/Qt5XfyxdyzQoCoWES8MeSsC5qdmfq6qPeUouazl4N07zjiGdmzpi9fJa1QaTmy0UC8UrzQffVCDJjdvxnxdhCLZgNmB4NO5VBE7ewmc+nbqtkVly+ARPqyteU+W19dF742g9vulnfXeSDteuXYkviATjZCfbdhZPXju+KrE1ii+xguv8SsJeVstIm+64ozXtRP9+wx5jXbsSyaU1Rq+2l+si7L7pP5R7Y043yg/2/fkdUufjzzVQjZI8/VgP4x4+cTafSUu+/u8Jnmxbok2ff76LKmCATwMX2ihtou70anq+6hheFI8xKCNZlzeR/9Df/j4rM7LboOieqw8IGEXJjCq4qWyn8oL42+K6HUsVs/LxQFm5C5khjoeFieq9KJ2iHDoSu1jk/elXvYBrXEtPxcEvnhaEzt7bUcZCH4qrzvtAM1+X0kNqe3mrY3NSnw08UT35ZNeKu0/ltddvOI8nJvm22gebzdVx0s9xHhliydRsy7hpb4lrwfsh+W/lteoOPuP7/A6HfZQp7z+mDHz2jKSIR1fbWSC26pHXzgYRKAWHUO97PP4KicPBBGHVRSfcEZ1Skf0Pbwk3YVeuX+GOiO1xX10emOnaT5cLpi58C+bVwd9eAxj09XCfHhwZj5NqOo2NV21TCkCM/DhY+hoeXqQ1yPrKalrW2QkVFv9MLp7L60FxdoUVV5ZtOdkI3Xys3mljtLBEam4xSuNd1hpAuWNVehH/bF/zCuthB3IFKm/aORpvW2svhIW2BLyUP2Ub/ZDs+Xmf6mEPapY4VuR1j/asSM1JakIeC18Lmj95f1xAX1zD1YnxGcm1anpbapqVNTluM2mAX5qlIuVyC+nmrjJj5WdzNQd/Kypr/kz/UmO9Tz/jeSIRXHE1zF6/sVPl9u3D3PcOMrOVx+5f705Mq8349WRzTjZt+cVTcw/Knj8nyGuyXglMPPtsMg0/Xs64jL2RA6/hdcyKFLQ0++gNaSGdDr8grnj2K9K4AlZ1of3ZnUY1JbnvZBG2fJtYRWVJCMjIyMjIyMjIyMjIyMjI+M+iMiQsJOjQO86jnJ97cibn/4ruwUdM2yEFEc+OullQ7q9qxfMXKHVqK2WcOLlkhpPFC6toSOBuEIFnzxNOrZqZznu0U7ERevCQcX8bphYc5Ddi3lx5plXIBZc5ldD6y0RHnNFiMYS5Tlpmfchs6ajKFXPYA+TxDoumXOheAdIxDhMSMG1U6RrqR0TUyjvYb/upywVeBBbig4OSn3zWl7CK17WGtoPXQykVzCIhGs4kOoc9BZNKs9Ny7FDiuCyA41gGTXKEdXqDisy61YSXnW9baxw8LtedgOlDj6ktKVEVxS+IWzTNErQVkhoIPz7Ul4STi8xw//Y4UM/FIyTriQaRlyjSQujquygAUKaDccqRShzQ6mIBEmaUVzQIpJxZUEQONgow4OI0rEBeMGG55gBznZCQuvgSaR/sbycIV214CUuvHCq6JETJRT3817jNCCr3teUGA7NDlLBZjnzIqyBKx55wU6UzchrbkcROvSrecH1OtdDL/EDwxHRWm90ZaXvuWwbVysz9CUOBtwLkm3YAJ2ybcwgCestg8uzODLNQJlVwJ1iLA2ruK46Db+smSwrTQc1tyPzdSkUG5h9cU+EwS7F5KgrjNJCai7QFZfDYMOcYB0V0OdGr11luMZIJ4GF5KkyMvRa9NmVkkvYFeZGDltaEq0ofDtszLc+rrBABp/9gl8G07Tq9l1V7DduPPNz27f/yUqBNvqJwqeGCpKRkZGRkZHx6/EXe9lNM3Onk3MAAAAASUVORK5CYII=';
export const mynahUIQRMarkdown = `![Mynah UI](${mynahUIQRImageBase64})`;

// react stateless function component example
export const exampleSources = [
  {
    url: 'https://github.com/aws/mynah-ui',
    title: 'MynahUI',
    body: '#### A Data & Event Drivent Chat Interface Library for Browsers and Webviews',
  },
  {
    url: 'https://github.com/aws/mynah-ui/blob/main/docs/STARTUP.md',
    title: 'MynahUI initial setup',
    body: `Simply install it from npm with your favorite package manager.
  \`\`\`
  npm install @aws/mynah-ui
  \`\`\`
  `,
  },
  {
    url: 'https://github.com/aws/mynah-ui/blob/main/docs/USAGE.md',
    title: 'How to use MynahUI',
    body: `To see how to configure statics for MynahUI please refer to **[Configuration](./CONFIG.md)** document.

  Lastly before you start reading here, you can find more details on the **[Data Model](./DATAMODEL.md)** document. That document also contains visuals related with each type of the chat message in detail.
  
  
  #### All publicly available functions
  \`\`\`typescript
  mynahUI.addChatItem(...);
  mynahUI.addToUserPrompt(...);
  mynahUI.getSelectedTabId();
  mynahUI.notify(...);
  mynahUI.updateLastChatAnswer(...);
  mynahUI.updateStore(...);
  \`\`\`
`,
  },
] as SourceLink[];

export const exampleStreamParts: Partial<ChatItem>[] = [
  { body: `${md0 as string}` },
  { body: `${md1 as string}` },
  { body: `${md2 as string}` },
  { body: `${md3 as string}` },
  { body: `${md4 as string}` },
  { body: `${md5 as string}` },
  { body: `${md6 as string}` },
  { body: `${md7 as string}` },
  { body: `${md8 as string}` },
  { body: `${md9 as string}` },
  { body: `${md10 as string}` },
  {
    relatedContent: {
      content: exampleSources,
      title: 'Sources',
    },
    codeReference: [
      {
        recommendationContentSpan: {
          start: 952,
          end: 967,
        },
        information: 'Say Hello to **`MynahUI`**.',
      },
      {
        recommendationContentSpan: {
          start: 1034,
          end: 1409,
        },
        information: 'Reference code *under the Apache License 2.0 license* from repository **`@aws/mynah-ui`**.',
      },
    ],
  },
];

export const exampleCodeBlockToInsert = SampleCode;

export const exampleRichFollowups: ChatItem = {
  type: ChatItemType.SYSTEM_PROMPT,
  messageId: new Date().getTime().toString(),
  followUp: {
    text: 'Rich followups',
    options: [
      {
        pillText: 'Accept',
        icon: MynahIcons.OK,
        description: 'You can accept by clicking this.',
        status: 'success',
      },
      {
        pillText: 'Reject',
        icon: MynahIcons.CANCEL,
        status: 'error',
      },
      {
        pillText: 'Retry',
        icon: MynahIcons.REFRESH,
        status: 'warning',
      },
      {
        pillText: 'Do nothing',
        icon: MynahIcons.BLOCK,
        status: 'info',
      },
    ],
  },
};

export const defaultFollowUps: ChatItem = {
  type: ChatItemType.ANSWER,
  messageId: new Date().getTime().toString(),
  followUp: {
    text: 'Example card types',
    options: [
      {
        command: Commands.STATUS_CARDS,
        pillText: 'Cards with status',
      },
      {
        command: Commands.FORM_CARD,
        pillText: 'Form items',
      },
      {
        command: Commands.FILE_LIST_CARD,
        pillText: 'File list',
      },
      {
        command: Commands.PROGRESSIVE_CARD,
        pillText: 'Progressive',
      },
      {
        command: Commands.IMAGE_IN_CARD,
        pillText: 'Image inside',
      },
      {
        command: Commands.CUSTOM_RENDERER_CARDS,
        pillText: 'Custom renderers',
      },
      {
        pillText: 'Followups on right',
        command: Commands.FOLLOWUPS_AT_RIGHT,
      },
      {
        pillText: 'Some auto reply',
        prompt: 'Some random auto reply here.',
      },
    ],
  },
};

export const exampleFileListChatItem: ChatItem = {
  type: ChatItemType.CODE_RESULT,
  body: '#### Here are the changed files:',
  buttons: [
    {
      id: 'open-diff-viewer',
      text: 'Open Diff Viewer',
      icon: MynahIcons.EXTERNAL,
      status: 'info',
      disabled: false,
    },
  ],
  fileList: {
    filePaths: ['src/App.tsx', 'devfile.yaml', 'src/App.test.tsx'],
    deletedFiles: ['src/devfile.yaml'],
    actions: {
      'src/App.tsx': [
        {
          icon: MynahIcons.CANCEL_CIRCLE,
          status: 'info',
          name: 'reject-change',
          description: 'Reject change',
        },
        {
          icon: MynahIcons.COMMENT,
          name: 'comment-to-change',
          description: 'Comment',
        },
      ],
      'devfile.yaml': [
        {
          icon: MynahIcons.CANCEL_CIRCLE,
          status: 'info',
          name: 'reject-change',
          description: 'Reject change',
        },
      ],
    },
    details: {
      'src/devfile.yaml': {
        status: 'error',
        label: 'Change rejected',
        icon: MynahIcons.REVERT,
      },
    },
  },
  codeReference: [
    {
      information: 'Reference code *under the MIT license* from repository `amazon`.',
    },
    {
      information: 'Reference code *under the MIT license* from repository `aws`.',
    },
  ],
  canBeVoted: true,
  messageId: 'file-list-message',
};

export const exampleFileListChatItemForUpdate: Partial<ChatItem> = {
  fileList: {
    filePaths: ['src/App.tsx', 'src/App.test.tsx'],
    details: {
      'src/App.tsx': {
        status: 'error',
        label: 'File rejected',
        icon: MynahIcons.CANCEL_CIRCLE,
      },
      'src/App.test.tsx': {
        status: 'warning',
        label: 'Comment added',
        icon: MynahIcons.COMMENT,
      },
    },
    actions: {
      'src/App.tsx': [
        {
          icon: MynahIcons.REVERT,
          name: 'revert-rejection',
          description: 'Revert rejection',
        },
      ],
      'src/App.test.tsx': [
        {
          icon: MynahIcons.PENCIL,
          name: 'update-comment',
          description: 'Update comment',
        },
      ],
    },
  },
};

export const exampleFormChatItem: ChatItem = {
  type: ChatItemType.ANSWER,
  messageId: new Date().getTime().toString(),
  body: `Can you help us to improve our AI Assistant? Please fill the form below and hit **Submit** to send your feedback.  

_To send the form, mandatory items should be filled._`,
  formItems: [
    {
      id: 'expertise-area',
      type: 'select',
      title: `Area of expertise`,
      options: [
        {
          label: 'Frontend',
          value: 'frontend',
        },
        {
          label: 'Backend',
          value: 'backend',
        },
        {
          label: 'Data Science',
          value: 'datascience',
        },
        {
          label: 'Other',
          value: 'other',
        },
      ],
    },
    {
      id: 'preferred-ide',
      type: 'radiogroup',
      title: `Preferred IDE`,
      options: [
        {
          label: 'VSCode',
          value: 'vscode',
        },
        {
          label: 'JetBrains IntelliJ',
          value: 'intellij',
        },
        {
          label: 'Visual Studio',
          value: 'visualstudio',
        },
      ],
    },
    {
      id: 'working-hours',
      type: 'numericinput',
      title: `How many hours are you using an IDE weekly?`,
      placeholder: 'IDE working hours',
    },
    {
      id: 'email',
      type: 'textinput',
      mandatory: true,
      title: `Email`,
      placeholder: 'email',
    },
    {
      id: 'name',
      type: 'textinput',
      mandatory: true,
      title: `Name`,
      placeholder: 'Name and Surname',
    },
    {
      id: 'ease-of-usage-rating',
      type: 'stars',
      mandatory: true,
      title: `How easy is it to use our AI assistant?`,
    },
    {
      id: 'accuracy-rating',
      type: 'stars',
      mandatory: true,
      title: `How accurate are the answers you get from our AI assistant?`,
    },
    {
      id: 'general-rating',
      type: 'stars',
      title: `How do feel about our AI assistant in general?`,
    },
    {
      id: 'description',
      type: 'textarea',
      title: `Any other things you would like to share?`,
      placeholder: 'Write your feelings about our tool',
    },
  ],
  buttons: [
    {
      id: 'submit',
      text: 'Submit',
      status: 'info',
    },
    {
      id: 'cancel-feedback',
      text: 'Cancel',
      keepCardAfterClick: false,
      waitMandatoryFormItems: false,
    },
  ],
};

const checkIcons = {
  wait: '![wait](data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjI0IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJtMTkgM2gtMTRjLTEuMTEgMC0yIC44OS0yIDJ2MTRhMiAyIDAgMCAwIDIgMmgxNGEyIDIgMCAwIDAgMi0ydi0xNGMwLTEuMTEtLjktMi0yLTJtMCAydjE0aC0xNHYtMTR6Ii8+PC9zdmc+)',
  current:
    '![current](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGNsYXNzPSJpY29uIGljb24tdGFibGVyIGljb24tdGFibGVyLXNxdWFyZS1kb3QiIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZT0iY3VycmVudENvbG9yIiBmaWxsPSJub25lIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPgogIDxwYXRoIHN0cm9rZT0ibm9uZSIgZD0iTTAgMGgyNHYyNEgweiIgZmlsbD0ibm9uZSIvPgogIDxyZWN0IHg9IjQiIHk9IjQiIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgcng9IjIiIC8+CiAgPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMSIgLz4KPC9zdmc+CgoK)',
  done: '![check](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGNsYXNzPSJpY29uIGljb24tdGFibGVyIGljb24tdGFibGVyLWNoZWNrYm94IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj4KICA8cGF0aCBzdHJva2U9Im5vbmUiIGQ9Ik0wIDBoMjR2MjRIMHoiIGZpbGw9Im5vbmUiLz4KICA8cG9seWxpbmUgcG9pbnRzPSI5IDExIDEyIDE0IDIwIDYiIC8+CiAgPHBhdGggZD0iTTIwIDEydjZhMiAyIDAgMCAxIC0yIDJoLTEyYTIgMiAwIDAgMSAtMiAtMnYtMTJhMiAyIDAgMCAxIDIgLTJoOSIgLz4KPC9zdmc+CgoK)',
};
export const exampleProgressCards: Partial<ChatItem>[] = [
  {
    body: `Hi there, we're currently working on your task. You can follow the steps below:

${checkIcons.wait} Reading your files in the project,

${checkIcons.wait} Analysing your project structure,

${checkIcons.wait} Finding weak points

${checkIcons.wait} Generating improvements

${checkIcons.wait} Creating a refactor plan

${checkIcons.wait} Showing the plan details

Once it is done, you'll be notified.`,
  },
  {
    body: `Hi there, we're currently working on your task. You can follow the steps below:

${checkIcons.current} Reading your files in the project,

${checkIcons.wait} Analysing your project structure,

${checkIcons.wait} Finding weak points

${checkIcons.wait} Generating improvements

${checkIcons.wait} Creating a refactor plan

${checkIcons.wait} Showing the plan details

Once it is done, you'll be notified.`,
  },
  {
    body: `Hi there, we're currently working on your task. You can follow the steps below:

${checkIcons.done} Reading your files in the project,

${checkIcons.current} Analysing your project structure,

${checkIcons.wait} Finding weak points

${checkIcons.wait} Generating improvements

${checkIcons.wait} Creating a refactor plan

${checkIcons.wait} Showing the plan details

Once it is done, you'll be notified.`,
  },
  {
    body: `Hi there, we're currently working on your task. You can follow the steps below:

${checkIcons.done} Reading your files in the project,

${checkIcons.done} Analysing your project structure,

${checkIcons.current} Finding weak points

${checkIcons.wait} Generating improvements

${checkIcons.wait} Creating a refactor plan

${checkIcons.wait} Showing the plan details

Once it is done, you'll be notified.`,
  },
  {
    body: `Hi there, we're currently working on your task. You can follow the steps below:

${checkIcons.done} Reading your files in the project,

${checkIcons.done} Analysing your project structure,

${checkIcons.done} Finding weak points

${checkIcons.current} Generating improvements

${checkIcons.wait} Creating a refactor plan

${checkIcons.wait} Showing the plan details

Once it is done, you'll be notified.`,
  },
  {
    body: `Hi there, we're currently working on your task. You can follow the steps below:

${checkIcons.done} Reading your files in the project,

${checkIcons.done} Analysing your project structure,

${checkIcons.done} Finding weak points

${checkIcons.done} Generating improvements

${checkIcons.current} Creating a refactor plan

${checkIcons.wait} Showing the plan details

Once it is done, you'll be notified.`,
  },
  {
    body: `Hi there, we're currently working on your task. You can follow the steps below:

${checkIcons.done} Reading your files in the project,

${checkIcons.done} Analysing your project structure,

${checkIcons.done} Finding weak points

${checkIcons.done} Generating improvements

${checkIcons.done} Creating a refactor plan

${checkIcons.current} Showing the plan details

Once it is done, you'll be notified.`,
  },
  {
    body: `Hi there, we're currently working on your task. You can follow the steps below:


${checkIcons.done} Reading your files in the project,

${checkIcons.done} Analysing your project structure,

${checkIcons.done} Finding weak points

${checkIcons.done} Generating improvements

${checkIcons.done} Creating a refactor plan

${checkIcons.done} Showing the plan details

Your refactor request is finished.

Here's a preview of list of the files to be refactored:

`,
    fileList: {
      filePaths: ['fil1.tsx', 'file2.tsx'],
      fileTreeTitle: 'Refactor result',
      rootFolderTitle: 'Refactored files',
    },
    buttons: [
      {
        id: 'open-refactor-plan',
        text: 'Open plan',
        disabled: false,
        icon: MynahIcons.EXTERNAL,
        status: 'info',
      },
    ],
  },
];

export const exampleImageCard = (): ChatItem => {
  return {
    messageId: new Date().getTime().toString(),
    type: ChatItemType.ANSWER,
    body: `
### Image!
Here's a QR code for mynah-ui github link:
  
${mynahUIQRMarkdown}
`,
  };
};

export const exampleCustomRendererWithHTMLMarkup = (): ChatItem => {
  return {
    messageId: new Date().getTime().toString(),
    type: ChatItemType.ANSWER,
    canBeVoted: true,
    customRenderer: `
<h3>Custom renderer's with HTML markup string</h3>
<p>
Here you will find some custom html rendering examples which may not be available with markdown or pretty hard to generate.
</p>
<br />
<h3>Table (inside a blockqote)</h3>
<blockquote>
Most popular JS frameworks
<hr />
<table>
  <tbody>
    <tr>
      <th align="left">Name</td>
      <th align="right">Weekly Downloads</td>
    </tr>
    <tr>
      <td align="left">Vanilla</td>
      <td align="right"><strong>inf.</strong></td>
    </tr>
    <tr>
      <td align="left">React</td>
      <td align="right">24 <small>million</small></td>
    </tr>
    <tr>
      <td align="left">JQuery</td>
      <td align="right">10.6 <small>million</small></td>
    </tr>
    <tr>
      <td align="left">VUE</td>
      <td align="right">4.75 <small>million</small></td>
    </tr>
  </tbody>
</table>
</blockquote>

<br />
<hr />
<br />

<h3>Code block and Links</h3>

<pre class="language-typescript">
<code>import { MynahUI } from '@aws/mynah-ui';

const mynahUI = new MynahUI({});</code>
</pre>
<p>
You can find more information and references <strong><a href="https://github.com/aws/mynah-ui">HERE!</a></strong>.
</p>

<br />
<hr />
<br />

<h3>Embeds and Media elements</h3>

<h4>Iframe embed (Youtube example)</h4>
<iframe aspect-ratio="16:9" src="https://www.youtube.com/embed/bZsIPinetV4?si=k2Awd9in_wKgQC09&amp;start=65" title="YouTube video player" allow="picture-in-picture;" allowfullscreen></iframe>
<br />
<h4>Video element</h4>
<video aspect-ratio="21:9" controls="" poster="https://assets.aboutamazon.com/88/05/0feec6ff47bab443d2c82944bb09/amazon-logo.png">
  <source src="https://www.w3schools.com/tags/movie.mp4" type="video/mp4">
  <source src="https://www.w3schools.com/tags/movie.ogg" type="video/ogg">
  Your browser does not support the video tag.
</video>
<br />
<h4>Audio element</h4>
<audio controls>
  <source src="https://www.w3schools.com/tags/horse.ogg" type="audio/ogg">
  <source src="https://www.w3schools.com/tags/horse.mp3" type="audio/mpeg">
  Your browser does not support the audio tag.
</audio>
<br />
<h4>Image</h4>
<img aspect-ratio src="https://d1.awsstatic.com/logos/aws-logo-lockups/poweredbyaws/PB_AWS_logo_RGB_REV_SQ.8c88ac215fe4e441dc42865dd6962ed4f444a90d.png" alt="Powered by AWS">

<br />
<hr />
<br />

<p>There might be infinite number of possible examples with all supported tags and their attributes. It doesn't make so much sense to demonstrate all of them here.
You should go take a look to the <strong><a href="https://github.com/aws/mynah-ui/blob/main/docs/DATAMODEL.md">documentation</a></strong> for details and limitations.</p> 
`,
  };
};

const attachmentIcon = `<svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="30" height="30" rx="4" fill="#687078"/>
<path d="M19.6853 13.1011V13.1011C20.2085 12.195 19.898 11.0364 18.9919 10.5132L18.251 10.0854C17.0553 9.39509 15.5263 9.80478 14.8359 11.0005L11.0859 17.4957C10.3956 18.6914 10.8053 20.2204 12.001 20.9108V20.9108C13.1967 21.6011 14.7257 21.1914 15.4161 19.9957L17.7911 15.8821C18.1362 15.2842 17.9314 14.5197 17.3335 14.1746V14.1746C16.7357 13.8294 15.9712 14.0342 15.626 14.6321L14.0992 17.2765" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
</svg>`;
export const exampleCustomRendererWithDomBuilderJson: ChatItem = {
  messageId: new Date().getTime().toString(),
  type: ChatItemType.ANSWER,
  canBeVoted: true,
  body: `Your Refactor analysis is ready! You can review it by opening the Markdown file: [file_name](#hello-pdf)
  You can also ask me any follow-up questions that you have or adjust any part by generating a revised analysis.`,
  customRenderer: [
    {
      type: 'blockquote',
      events: {
        click: (e: Event) => {
          console.log('Hello!', e);
        },
      },

      children: [
        {
          type: 'table',
          children: [
            {
              type: 'tr',
              children: [
                {
                  type: 'td',
                  attributes: {
                    style: 'min-width: 30px; width: 30px;',
                  },
                  children: [
                    {
                      type: 'img',
                      attributes: {
                        src: `data:image/svg+xml;base64,${window.btoa(attachmentIcon)}`,
                      },
                    },
                  ],
                },
                {
                  type: 'td',
                  children: [
                    {
                      type: 'strong',
                      children: ['Refactor_analysis_[id] .pdf'],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export const exampleDownloadFile: ChatItem = {
  messageId: new Date().getTime().toString(),
  type: ChatItemType.ANSWER,
  canBeVoted: true,
  body: `Your Refactor analysis is ready! You can review it by opening the Markdown file: [file_name](#hello-pdf)
  You can also ask me any follow-up questions that you have or adjust any part by generating a revised analysis.`,
  fileList: {
    fileTreeTitle: 'Report',
    rootFolderTitle: '',
    filePaths: ['Refactor_analysis_[id] .pdf']
  },
};
