import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { toIpfsGatewayURL } from "../support/ipfsGateway";

const ImageGallery = (props: {
  images: {
    title: string;
    image_src: string;
  }[];
}) => {
  const { images } = props;
  return (
    <Carousel showArrows={true} showThumbs={false} dynamicHeight={true}>
      {images.map((image, index) => (
        <div key={index}>
          <img src={toIpfsGatewayURL(image.image_src)} />
        </div>
      ))}
    </Carousel>
  );
};

export default ImageGallery;
