export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Holding Şirketi</h3>
            <p>Dünya standartlarında hizmet anlayışı ile sektörde öncü konumdayız.</p>
          </div>
          <div className="footer-section">
            <h4>Hızlı Linkler</h4>
            <ul>
              <li>
                <a href="#kurumsal">Kurumsal</a>
              </li>
              <li>
                <a href="#hizmetler">Hizmetlerimiz</a>
              </li>
              <li>
                <a href="#ik">İ.K</a>
              </li>
              <li>
                <a href="#referanslar">Referanslar</a>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Yasal</h4>
            <ul>
              <li>
                <a href="#cerez">Çerez Politikası</a>
              </li>
              <li>
                <a href="#aydinlatma">Aydınlatma Metni</a>
              </li>
              <li>
                <a href="#gizlilik">Gizlilik Sözleşmesi</a>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>İletişim</h4>
            <p>+90 0850 466 04 77</p>
            <p>info@holding.com.tr</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Holding Şirketi, Her hakkı saklıdır.</p>
          <p>Web Tasarım MediaClick</p>
        </div>
      </div>
    </footer>
  );
}
